#include <SPI.h>
#include <PN532_SPI.h>
#include "PN532.h"

//NFC things
PN532_SPI pn532spi(SPI, 10);
PN532 nfc(pn532spi);

// LED vars 
const int ledPin = 13;

// LED read vars
String inputString = "";         // a string to hold incoming data
boolean toggleComplete = false;  // whether the string is complete
char inChar;

// Potmeter vars
const int analogInPin = A0;
int sensorValue = 0;        // value read from the potmeter
int prevValue = 0;          // previous value from the potmeter

//load cell calibration
float loadA = 0.355; 
int analogvalA = 130; 
float loadB = 0.440; 
int analogvalB = 220; 
float analogValueAverage = 0;

//FSM for the system
int Filloaster_State = 0;
/*
If 0, then nothing is on it.
If 1, then glass is on it, get glass weight.
If 2, drink is being poured. If value stablizes, go to 3
If 3, Measure the total amount (glass + drink). If less than x go to 4
If 4, Then send signal to refill.
*/

//FSM for NFCs
int NFC_State = 0;
/*
If 0, then waiting for phone number
If 1, then halting for diff NFC
If 2, then waiting for type of drink
If 3, then not waiting.
*/


//Constants to measure liquid.
float noWeights;
float glassWeight;
int glassConstant = 3; //magic number
float calibWeight = 0;
int calibCount = 0;
float sumOfCalibLoads = 0;
float fullGlass;
float currentGlass = 0;

//other constants
float amountDrunk = 0;
float totalAmountDrunk = 0;
float refillThreshold = 0.5;

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // init LEDS
  pinMode(ledPin,OUTPUT);
  digitalWrite(ledPin,0);
  // init NFC modules
  nfc.begin();
  nfc.setPassiveActivationRetries(0xFF);
  nfc.SAMConfig();    
}


void loop() 
{
  boolean success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  // Buffer to store the returned UID
  uint8_t uidLength;                        // Length of the UID 
  //Currently using a tag to mimick phone
  //tagData is 467F0A433D80
  if (NFC_State == 0)
  {
    getPhoneNumber(success, uid, uidLength);
  }
  //Have a delay period
  if (NFC_State == 1)
  {
    delay(5000);
    NFC_State = 2;
  }
  //Get the type of drink
  if (NFC_State == 2)
  {
    getGlassType(success, uid, uidLength);
  }
  if (NFC_State == 3)
  {
    senseorMeasurements();
    delay(50); // give the Arduino some breathing room.
  }
}

void getPhoneNumber(boolean success, uint8_t uid[], uint8_t uidLength){
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, &uid[0], &uidLength);
  if (success) 
  {
    Serial.print("P"); // begin character 
    for (uint8_t i=0; i < uidLength; i++) 
    {
      Serial.print(uid[i], HEX); 
    }
    Serial.print("H"); // end character
    NFC_State = 1;
    // Wait 1 second before continuing
  }
  else
  {
    // PN532 probably timed out waiting for a card
    Serial.println("Timed out waiting for a card");
  }
}

void getGlassType(boolean success, uint8_t uid[], uint8_t uidLength)
{
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, &uid[0], &uidLength);
  if (success) 
  {
    Serial.print("N"); // begin character 
    for (uint8_t i=0; i < uidLength; i++) 
    {
      Serial.print(uid[i], HEX); 
    }
    Serial.print("C"); // end character
    NFC_State = 3;
    // Wait 1 second before continuing
  }
  else
  {
    Serial.println("Timed out waiting for a card");
  }
}

void senseorMeasurements()
{
  //Deals with incoming messages
  receivedSignalFromNode();
  //Convert analog value to load (in mL)
  int analogValue = analogRead(0);
  analogValueAverage = 0.99*analogValueAverage + 0.01*analogValue;
  float load = analogToLoad(analogValue) * 1000;
  





  // Potmeter
   sensorValue = analogRead(analogInPin);  
  // read the analog in value:
  if(prevValue != sensorValue)
  {
    Serial.print("B"); // begin character 
    //Serial.print((int)load); Not fully accurate 
    Serial.print(sensorValue); 
    Serial.print("E"); // end character
    prevValue = sensorValue;
    Serial.print("\n");
  } 
}

//Converts AnalogValue to an actual weight.
float analogToLoad(float analogval){
  float load = mapfloat(analogval, analogvalA, analogvalB, loadA, loadB);
  return load;
}
//Map function for float
float mapfloat(float x, float i_min, float in_max, float out_min, float out_max)
{
  return (x - i_min) * (out_max - out_min) / (in_max - i_min) + out_min;
}

void receivedSignalFromNode()
{
  // Recieve data from Node and write it to a String
  while (Serial.available() && toggleComplete == false) 
  {
    inChar = (char)Serial.read();
    if(inChar == 'E')
    { // end character for led
      toggleComplete = true;
    }
    else
    {
      inputString += inChar; 
    }
  }
  // Toggle LED 13
  if(!Serial.available() && toggleComplete == true)
  {
    toggling();
  }
}

void toggling()
{
  // convert String to int. 
  int recievedVal = stringToInt();
  
  if(recievedVal == 0)
  {
    digitalWrite(ledPin,recievedVal);
  }
  else if(recievedVal == 1)
  {
    digitalWrite(ledPin,recievedVal);
  }    
  toggleComplete = false;
}

int stringToInt()
{
    char charHolder[inputString.length()+1];
    inputString.toCharArray(charHolder,inputString.length()+1);
    inputString = "";
    int _recievedVal = atoi(charHolder);
    return _recievedVal;
}






