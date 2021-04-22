## Zero Degree
(React Native/Expo package)

A Javascript module that constantly monitors and returns the direction angle of the target location as the phone rotates or moves. This is a React Native/Expo package.

### What it does
- Monitors device location (GPS) and device heading (using magnetometer sensor).
- Constantly returns angle (in degree) between the device and the target.
- The value returns from the module is from -179 to 180 degree; 0 degree means the device is pointed to the target perfectly.
- It returns the degree value accurately even the phone is on hand and tilted, i.e. not perfectly horizontal.

### How to use
```js
let _Mecca = { latitude: 21.42287137530198, longitude: 39.82573402862004 };

let zeroDegree = new ZeroDegree(_Mecca);
zeroDegree.watch(degree => console.log(degree),
   err => console.error(err));
```

This is basic usage. In real projects, it should be used with `useEffect/useState`.


See a real world example, here's a precise demo:
https://snack.expo.io/@tareqshahriar/zero_degree

You can check it on a real device. Install **Expo Go** app (iOS, Android) and open the link on with the app.

### Events, Props etc
*Constructor parameter*: An Json object containing latitude, longitude of the target location.
```js
const _Mecca = { latitude: 21.422507552770295, longitude: 39.826191913255556 };
let zeroDegree = new ZeroDegree(_Mecca);
```

*zeroDegreeObj.watch(onDegreeUpdate, onError)*: Instance method, to start watching the device location and device heading.
- *onDegreeUpdate callback*: Constantly receives the degree value of the phone heading with respect to target as the phone moves. It receives the degree as an integer.
```js
await zeroDegree.watch(degree => console.log(degree));
```

- *onError callback*: It will be called whenever a error will be occurred, with an object as argument having error details.

```js
zeroDegree.watch(
   degree => console.log(degree), 
   errData => console.error(errData);
);
```

*zeroDegreeObj._getLogData*: For debugging purpose. Assign a function to it to receive additional data in an object.
```js
zeroDegree._getLogData = info => console.log(info);
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
      zeroDegree._getLogData = log => setLog(log);

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
