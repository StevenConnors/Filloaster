#include "SPI.h"
#include "PN532_SPI.h"
#include "snep.h"
#include "NdefMessage.h"


// Delete this for actual
int noLogic = 1;

//NFC Constants
PN532_SPI pn532spi(SPI, 10);
SNEP nfc(pn532spi);
uint8_t ndefBuf[128];
//NFC Vars
String drinkType = "";

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
}


void loop() 
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
  int analogValue = analogRead(0);
  analogValueAverage = 0.99*analogValueAverage + 0.01*analogValue;
  float load = analogToLoad(analogValue) * 1000;
  // Potmeter
   sensorValue = analogRead(analogInPin);  

  // read the analog in value:
  if(prevValue != sensorValue)
  {
    Serial.print("B"); // begin character 
    //Serial.print(Filloaster_State);
    //Serial.print(".....");
    //Serial.print(load); Not fully accurate 
    Serial.print(sensorValue); 
    Serial.print("E"); // end character
    prevValue = sensorValue;
  } 
  delay(50); // give the Arduino some breathing room.
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


//Converts AnalogValue to an actual weight.
float analogToLoad(float analogval){
  float load = mapfloat(analogval, analogvalA, analogvalB, loadA, loadB);
  return load;
}
//Map function for float
float mapfloat(float x, float in_min, float in_max, float out_min, float out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}






/*
The ReadTag sketch uses I2C interface by default, change code to use SPI as following.
#include <SPI.h>
#include "PN532_SPI.h"
#include "PN532.h"
#include "NfcAdapter.h"
 
PN532_SPI interface(SPI, 10);
NfcAdapter nfc = NfcAdapter(interface);
 
void setup(void) {
    Serial.begin(115200);
    Serial.println("NDEF Reader");
    nfc.begin();
}
 
void loop(void) {
    Serial.println("\nScan a NFC tag\n");
    if (nfc.tagPresent())
    {
        NfcTag tag = nfc.read();
        tag.print();
    }
    delay(5000);
}
*/





