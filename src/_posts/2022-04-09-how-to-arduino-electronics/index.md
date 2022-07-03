---
title: "Remembering how to Arduino"
layout: eternal-draft
date: 2022-04-09
updates:
  - 2022-04-26
# comments:
#   tweet:
#     id: "1369262520603607040"
#     text: Here&#39;s a collection of random tips for getting better at <a href="https://twitter.com/hashtag/CloudFormation?src=hash&amp;ref_src=twsrc%5Etfw">#CloudFormation</a>, curated between mashing the refresh button as my stack deployed<a href="https://t.co/74W0fYzD4X">https://t.co/74W0fYzD4X</a>
#     dateString: March 9, 2021
---

I pull out an Arduino and try to do electronics stuff about once a year. That's a short enough period to fool me into thinking I can knock something together easily, but not short enough for me to retain any useful memory of how electronics work. This is an attempt to retain information for myself next time.

<!-- excerpt -->

I've bough most of my Arduino stuff from [Jaycar](https://www.jaycar.com.au/) so this document references those modules a lot.

I have an original [Arduino Uno](https://www.arduino.cc/en/main/arduinoBoardUno) so most of this has to do with that board.

### How to use a multimeter

#### Continuity

You can use a multimeter to test the continuity of a cable (i.e. is it capable of conducting a circuit between the two terminals of your multimeter). This is especially useful fro those crap jumper wires, they are constantly breaking invisibly internally and can screw up a circuit you were certain would work.

The symbol on my multimeter looks like a play button with a line at the end. Set your multimeter to that. The display reads `1`. Now, touch the each terminal of the multimeter to each end of a jumper lead. If the number dips from 1000 towards near zero, you have continuity.

[This ifixit article](https://www.ifixit.com/Guide/How+To+Use+A+Multimeter/25632#s64987) looks useful. The continuity mode is in the same position on my multimeter.

If all else fails, jam an LED in somewhere to check if there's a circuit.

### Hall Effect Sensor Module

Used to detect the presence of a strong magnetic field. Can't give a quantitative value as far as I'm aware, just on or off. I have a [XC-4434](https://www.jaycar.com.au/arduino-compatible-hall-effect-sensor-module/p/XC4434) module.

Pin reference:

- `-` pin: Ground
- Middle pin: 5V in
- `S` pin: Signal out

Use a 10k ohm resister across the signal and 5V pins, [apparently to smooth out the signal](https://forum.arduino.cc/t/really-simple-question-why-i-need-a-pull-up-resistor/391925).

30 gauss activation? Check magnets.

Some code that will fire an "interrupt" when the Hall Effect sensor is connected to Arduino pin 2, and the sensor detects a magnet:

```arduino
#define HALL_SENSOR_PIN 2

// volatile!
volatile byte currentLED;

// This function is called whenever a magnet/interrupt
// is detected by the arduino
void magnet_detect_session() {
  currentLED++;
}

void setup() {
  currentLED = 0;
  // Initialize the interrupt pin (Arduino digital pin 2)
  attachInterrupt(
    digitalPinToInterrupt(HALL_SENSOR_PIN),
    magnet_detect_session,
    FALLING
  );
}

void loop() {
  // magnet_detect_session();
}
```

Variables referenced inside interrupts should be `volatile` [for some reason](https://www.arduino.cc/reference/en/language/functions/external-interrupts/attachinterrupt/#_notes_and_warnings).

### WS2812B LED Strip

Got a [WS2812B strip](https://www.amazon.com.au/dp/B019DYZNO6/ref=pe_2361882_282382012_TE_item?th=1) online, it was $18 when I bought it, now seems to be $43??

- [This article mentions some safety tips your LED strip](https://learn.sparkfun.com/tutorials/ws2812-breakout-hookup-guide/hardware-hookup)
  - Capacitor: add a 100 - 1000 µF capacitor across the power and ground pins, close to LED strip
  - Resistor: add a 220 - 470 ohms resistor between the Arduino signal out and the LED strip data line

### External power for Arduino Uno and LEDs

[MP-3480](https://www.jaycar.com.au/5v-dc-3a-slim-power-supply-7dc-plugs/p/MP3480)

### Markings

- O O O markings on capacitor point to negative terminal
- 104M capacitor is 0.1 uF

### USB to Serial Adaptor Module

UART serial control flow!?

[XC-4464](https://www.jaycar.com.au/arduino-compatible-usb-to-serial-adaptor-module/p/XC4464)

- `TXD` -> Arduino `RXD`
- `RXD` -> Arduino `TXD`
- `CTS` -> Arduino `RESET` ???

Something about the pin needed to signal that a program should be loaded in.

Serial comms on `/dev/tty.*` or `/dev/cu.*`

Mini USB lol

#### Here's something that almost worked

Except you have to press the hardware reset button to get it working after hitting upload

[This is the post that finally twigged for me](https://forum.arduino.cc/t/how-to-make-a-dtr-reset/385699/2)

From USB serial module -> Arduino

- GND -> GND
- CTS x> not attached
- 5V -> 5V
- (but also 5V -> 10kø resistor -> RESET) (actually it works without this :( ffs)
- TXD -> RXD
- RXD -> TXD
- DTR -> 0.1uF cap -> RESET

[COuld this be why the reset doesn't work?](https://forum.arduino.cc/t/ftdi-ttl-rs232-and-arduino-programming/605537/6)

### Code

```arduino
#include <FastLED.h>

#define HALL_SENSOR_PIN_1 2
#define HALL_SENSOR_PIN_2 3
#define LED_CONTROL_PIN 7

// #define NUM_LEDS 144 // 1 strand
#define NUM_LEDS 288 // double strand
#define SERIAL_BAUD 115200
#define SESSION_ID_LENGTH 20

#define FRAMERATE 15

// in mA
#define MAX_POWER_DRAW 500 // USB hub
// #define MAX_POWER_DRAW 3000 // 5V external power pack

volatile byte currentLED;
volatile byte currentLED2;

volatile byte session1Revolutions;
volatile byte session1Revolutions2;

volatile byte session2Revolutions;
volatile byte session2Revolutions2;

String sessionID1;
String sessionID2;

CRGB leds[NUM_LEDS];

// This function is called whenever a magnet/interrupt is detected by the arduino
void magnet_detect_session_1() {
  // Serial.println("YO");
  leds[currentLED] = CRGB(
    rainbow_calc(currentLED, NUM_LEDS / 2, 0),
    rainbow_calc(currentLED, NUM_LEDS / 2, 1),
    rainbow_calc(currentLED, NUM_LEDS / 2, 2));
  currentLED++;
  if (currentLED >= NUM_LEDS / 2) {
    currentLED = 0;
    reset_leds(0, NUM_LEDS / 2);
  }
  if (session1Revolutions == 254) {
    session1Revolutions2++;
  }
  session1Revolutions++;
}

// This function is called whenever a magnet/interrupt is detected by the arduino
void magnet_detect_session_2() {
  // Serial.println("YO");
  leds[currentLED2 + (NUM_LEDS / 2)] = CRGB(
    rainbow_calc(currentLED2, NUM_LEDS / 2, 0),
    rainbow_calc(currentLED2, NUM_LEDS / 2, 1),
    rainbow_calc(currentLED2, NUM_LEDS / 2, 2));
  currentLED2++;
  if (currentLED2 >= NUM_LEDS / 2) {
    currentLED2 = 0;
    reset_leds(NUM_LEDS / 2, NUM_LEDS);
  }
  if (session2Revolutions == 254) {
    session2Revolutions2++;
  }
  session2Revolutions++;
  // Serial.println("Signal2");
}

// Clear all LEDs
void reset_leds(int start, int end) {
  for (int i = start; i < end; i++) {
    leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
  // Serial.println("Reset");
}

int rainbow_calc(double pixel, double maxPixels, double rgb_colour_id) {
  double result = abs(
    255 * cos((pixel / maxPixels) * (2 * PI) + (rgb_colour_id * (2 * PI) / 3)));

  // Serial.println(result);
  return result;
}

void setup() {
  currentLED = 0;
  session1Revolutions = 0;
  session1Revolutions2 = 0;

  currentLED2 = 144;
  session2Revolutions = 0;
  session2Revolutions2 = 0;

  //Initialize the intterrupt pin (Arduino digital pin 2)
  attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN_1), magnet_detect_session_1, FALLING);
  attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN_2), magnet_detect_session_2, FALLING);

  FastLED.addLeds<WS2812, LED_CONTROL_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_POWER_DRAW);

  Serial.begin(SERIAL_BAUD);

  randomSeed(analogRead(0));
  sessionID1 = "left_"  + generate_session_id();
  sessionID2 = "right_" + generate_session_id();
  Serial.println("Session ID 1 " + sessionID1);
  Serial.println("Session ID 2 " + sessionID2);

  reset_leds(0, NUM_LEDS);
}

String generate_session_id() {
  String newID = "";
  int generated = 0;
  while (generated < SESSION_ID_LENGTH) {
    byte randomValue = random(0, 26);
    char letter = randomValue + 'a';
    if (randomValue > 26)
      letter = (randomValue - 26);
    newID += letter;
    generated++;
  }
  return newID;
}

void loop() {
  // magnet_detect_session_1();
  FastLED.show();

  // fill_rainbow(leds, 40, 200);
  // fill_noise8(leds, 40, 2, 1,255, 5, 6, 255, 6);
  // fadeLightBy(leds, 20, 250);

  // char letter = random(0, 26);

  int revs = session1Revolutions + (session1Revolutions2 * 254);
  Serial.println(sessionID1 + " : " + revs);

  int revs2 = session2Revolutions + (session2Revolutions2 * 254);
  Serial.println(sessionID2 + " : " + revs2);
  // Serial.println(letter);
  // leds[0] = CRGB(255, 0, 0);
  // FastLED.show();

  delay(1000 / FRAMERATE);
  // Serial.println("oh heck");
  // leds[1] = CRGB(0, 255, 0);
  // FastLED.show();
  // delay(500);
  // leds[2] = CRGB(0, 0, 255);
  // FastLED.show();
  // delay(500);
  // leds[3] = CRGB(150, 0, 255);
  // FastLED.show();
  // delay(500);
  // leds[4] = CRGB(255, 200, 20);
  // FastLED.show();
  // delay(500);
  // leds[5] = CRGB(85, 60, 180);
  // FastLED.show();
  // delay(500);
  // leds[6] = CRGB(50, 255, 20);
  // FastLED.show();
  // delay(500);
}
```
