## Zero Degree
(React Native/Expo package)

A Javascript module that constantly monitors and returns the direction angle of the target location as the phone rotates or moves. This is a React Native/Expo package.


*(For Github users: NPM package link - https://www.npmjs.com/package/zero-degree)*

### What it does
- Monitors device location (GPS) and device heading (using magnetometer sensor).
- Constantly returns angle (in degree) between the device and the target.
- The value returns from the module is from -179 to 180 degree; 0 degree means the device is pointed to the target perfectly.
- It returns the degree value accurately even the phone is on hand and tilted, i.e. not perfectly horizontal.

### How to use
```js
import ZeroDegree from 'zero-degree';

let _Mecca = { latitude: 21.42287137530198, longitude: 39.82573402862004 };
let zeroDegree = new ZeroDegree(_Mecca);
zeroDegree.watchAsync(degree => console.log(degree));
```

This In project, use with `useEffect/useState`.

Check out a demo: https://snack.expo.io/@tareqshahriar/zero_degree

You can run the demo on a real device. Install **Expo Go** app (<a href="https://apps.apple.com/us/app/expo-go/id982107779">iOS app</a> / <a href="https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en&gl=US">Android app</a>); on mobile browser, tap the demo link, it will be prompted to open the demo using *Expo Go*.

### Events, Props etc
*Constructor parameter*: An Json object containing latitude, longitude of the target location.
```js
const _Greenland = { latitude: 76.94606201163724, longitude: -43.474120688453034 };
let zeroDegreeObj = new ZeroDegree(_Greenland);
```

*zeroDegreeObj.watch(onDegreeUpdate, onError)*: Instance method, to start watching the device location and device heading.
- *onDegreeUpdate callback*: Constantly receives the degree value of the phone heading with respect to target as the phone moves. It receives the degree as an integer.
```js
await zeroDegreeObj.watchAsync(degree => console.log(degree));
```

*onError callback*: It will be called whenever a error will be occurred, with an object as argument having error details.

```js
zeroDegreeObj.watchAsync(
   degree => console.log(degree), 
   errData => console.error(errData);
);
```

*zeroDegreeObj._getLogData*: For debugging purpose. Assign a function to it to receive additional data in an object.
```js
zeroDegreeObj._getLogData = log => console.log(log);
```

### A Complete Example
```js
// App.js
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import ZeroDegree from 'zero-degree';

let _Mecca = { latitude: 21.42287137530198, longitude: 39.82573402862004 };

export default function App() {
   const [err, setError] = useState(null);
   const [degree, setDegree] = useState(null);
   const [log, setLog] = useState(null);

  useEffect(() => {
    let zeroDegree;
    async function initZeroDegree() {
      zeroDegree = new ZeroDegree(_Mecca);  
      zeroDegree._getLogData = log => setLog(log); // optional

      await zeroDegree.watchAsync(degree => setDegree(Math.round(degree)),
        err => setError(err));
    }

    initZeroDegree();

    return () => zeroDegree.unwatch();
   }, []);

  return (
    <View>
      <Text>Target: {degree}&deg;</Text>
      <Text>Error: {JSON.stringify(err)}</Text>
      <Text>Info: {JSON.stringify(log)}</Text>
    </View>
  );
}
```

### Accuracy Test and Results
Device: IPhone 7
Location: Dhaka, Bangladesh

| Targets | Result |
| --------|--------|
| Mecca, Saudi Arabia | OK |
| Greenland (north pole) | OK |
| Somewhere in exact north (Yeniseysky, Russia)  | OK |
| Exact south (Indian Ocean) | OK |
| Exact west (Algeria) | OK |
| Exact east (North Pacific Ocean) | OK |
| New Zealand | OK |
| Antarctica (south pole) | OK |
| Nunavut, Canada | OK |

To perform a reverse test, different locations were passed to the module as the device's current location, ignoring the GPS data.

Target: Mecca, Saudi Arabia

| Device Mocked Location            | Result |
| ----------------                  | ------ |
| Melbourne, Australia              | OK     |
| Greenland (north pole)            | OK*    |
| Somewhere in Indian Ocean (exact south of Mecca) | OK     |
| Somewhere in Barents Sea (exact north of Mecca | OK     |
| Timaukel, Magallanes and Chilean Antarctica, Chile | OK     |
| South China Sea (exact east of Mecca) | OK     |
| Antarctic Ice shield, Antarctica  | Seems OK*  |

[*] On earth globe, Antarctic Ice shield, Antarctica (-75.36047491435592, -79.42558210228636) is at southern pole which is under the the globe. As a mocked location, it produces good result, but surely on south pole (and on north pole) magnetometer will not work.
