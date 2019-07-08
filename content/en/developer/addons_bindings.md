+++
title = "Develop Bindings"
author = "David Graeff"
weight = 51
tags = []
+++

There are a few helper and tool libraries available to ease mapping http endpoints, mqtt topics and coap endpoints to Things and Thing Channels. 

A binding that binds an mqtt topic to a Thing is written in just 20 lines of code, a http API based weather service binding takes around the same code. Find an mqtt and http binding walkthrough at the end of this chapter.  

Each supported programming language has a template repository with multiple examples that you can clone, build and play around with. If you haven't checked one out yet, go back to [Setting up the development enviroment](/developer/addons#setting-up-the-development-enviroment).

Pick the language that you are either familiar with or that helps to solve a problem the easiest way. For instance, because of the project [openzwave](https://github.com/OpenZWave/open-zwave) that is written in C++, it makes sense to pick the C++ SDK for a ZWave based Addon.

Examples in this chapter are written in Rust.

## Things

You have learned about the Things concept in the user guide already.
Implementation wise, they are composed of three parts.

1. A JSonSchema to declare a Thing,
2. Configuration that defines an actual Thing instance,
3. and a Thing handler.

A Thing has channels. A hifi amplifier Thing for example has a power, mute, volume channel etc. Channels are added during runtime by the Thing handler.

A user may add a Thing manually, by providing Thing configuration to openHAB X.

A Thing in openHAB X

## Example MQTT Topic to Thing Binding

## Walkthrough: HTTP - A Weather Forecast Binding

<a href="https://www.weather.gov/" style="float:right;max-width:50%" target="_blank" class="card-hover"><img src="/img/doc/usa-national-weather-service.png" class="w-100"></a>

In this section we are going to integrate a weather forecast service into OHX via the HTTP to Thing utility libraries.
The entire development process including initial design questions is handled.

We are going to use the National Weather Service (USA), because it does not require any form of authorisation.
Usually you want to register to your favourite, locale weather service and use the API Key in your requests.

### Familiarize with the required HTTP endpoints

To start with, all the endpoints use the API base https://api.weather.gov (as documented on their website). The basic endpoints are all extensions of that original API base to include latitude and longitude values. 

For this walkthrough, we’re going to get the local weather for Richmond, Va. We’re going to use the following location:

* latitude = 37.540726
* longitude = -77.436050

Lets get the metadata for that location using the metadata endpoint:

    https://api.weather.gov/points/{<latitude>,<longitude>}

So for the Richmond location, this would look like:

    https://api.weather.gov/points/37.540726,-77.436050

A response contains content like this:

```json
{
  "properties": {
     "forecast": "https://api.weather.gov/gridpoints/AKQ/45,76/forecast",
     "forecastHourly": "https://api.weather.gov/gridpoints/AKQ/45,76/forecast/hourly",
     "forecastGridData": "https://api.weather.gov/gridpoints/AKQ/45,76",
  }
}
```

Evaluating the response we find the link for a 12h-period forecast: "https://api.weather.gov/gridpoints/AKQ/45,76/forecast".

A forecast response, again, contains a *properties* key which contains a list of *periods*.
```json
{
  "properties": {
    "periods": [
        {
            "number": 1,
            "name": "Today",
            "startTime": "2019-06-17T11:00:00-04:00",
            "endTime": "2019-06-17T18:00:00-04:00",
            "isDaytime": true,
            "temperature": 93,
            "temperatureUnit": "F",
            "temperatureTrend": null,
            "windSpeed": "6 to 12 mph",
            "windDirection": "SW",
            "icon": "https://api.weather.gov/icons/land/day/sct/tsra_hi,40?size=medium",
            "shortForecast": "Mostly Sunny then Chance Showers And Thunderstorms",
            "detailedForecast": "A chance of showers and thunderstorms between 2pm and 5pm, ..."
        },
    ]
  }
}
```

For all half-structured, in this case json formatted, responses you can use https://app.quicktype.io/ to generate structures/classes for your desired programming language.

### Channel topology

We now need to decide on the Thing Channel topology.
One way is to create two Things called **WeatherForecast12hoursPeriod** for a 12hours period and **WeatherForecast1hourPeriod** for a 1h forecast period.
We then assign channels for today and tomorrow and for now, in 1h, in 2h, in 3h respectively.

    [Addon] HTTP -> [Thing] WeatherForecast12hoursPeriod -> [Channel] Today (Number, Unit: °F)
                                                         -> [Channel] Tonight (Number, Unit: °F)
                                                         -> [Channel] Tomorrow (Number, Unit: °F)
                                                         -> [Channel] Tomorrow Night (Number, Unit: °F)
                 -> [Thing] WeatherForecast1hourPeriod -> [Channel] Now (Number, Unit: °F)
                                                       -> [Channel] In1h (Number, Unit: °F)
                                                       -> [Channel] In2h (Number, Unit: °F)
                                                       -> [Channel] In3h (Number, Unit: °F)

### Define Things

A Thing in openHAB X

The channel configuration can be performed entirely in the graphical interface.
For brevity we will only look at the textual representation of the first channel *Today (Number, Unit: °F)* though.
If you are interested in all channel configuration options of the http addon, check the documentation page out:
[HTTP Addon](/addons/http).

A channel is by default read-only and a http channel in particular is by default a GET request with no additional http headers attached. Have a look at the channel definition:

{{< highlight yaml "linenos=table" >}}
today:
    context: Temperature
    image:
        uri: https://api.weather.gov/icons/land/day/sct/tsra_hi,40?size=medium
    type: integer
    unit: °F
    http_in:
        cache: 180 # Cache time in minutes
        uri: https://api.weather.gov/gridpoints/AKQ/45,76/forecast
    processors_in:
        - jsonpath:
            path: $.properties.periods[0].temperature # http://jsonpathfinder.com/ helps here
{{< / highlight >}}

We choose an **image** (can be a statically uploaded image or an internet URL), a type, [unit](/developer/addons#unit-of-measurement) and where to get the data from. For an http channel that is set via the **http_in** configuration.

As we already know the data is a json encoded object. In OHX we use so called *processors* to transform an input to another value. Via **processors_in** we can define one or multiple [processors](/userguide/channellinks#processors). We use the *jsonpath* processor to extract the temperature. 

The **context** refers to a specific defined schema, in our case the value represents a "Temperature". This helps user interfaces to render the channel correctly.
Schema repositories can be found at http://iotschema.org/ and https://iot.mozilla.org/schemas). The graphical interface will show a selection.

### A few notable things

That's it for our weather forecast integration. 

A non read-only (writable) http channel would need to have `http_out` and probably a method like *post* and an authorisation header to be defined. You can find all options in the documentation: [HTTP Addon](/addons/http).
 
MQTT (and CoAP) speaking devices can be integrated in a very similar fashion, you would just define an *mqtt_subscribe* and *mqtt_publish* topics for retrieving and sending values. See [MQTT Addon](/addons/mqtt) and [CoAP Addon](/addons/coap).