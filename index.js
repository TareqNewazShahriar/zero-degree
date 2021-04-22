import * as Location from 'expo-location';

/// Prototype based design is used insteam of class; because it's powerful
function ZeroDegree(targetLatLon) {
   const _TARGET_LAT_LON = targetLatLon;

   /* -----------private variables------------- */
   let _angleOfUserAndTarget;
   let _angleOfPhoneAndTarget
   let _lastDegree = 0;

   /* Handlers/callbacks */
   let _onDegreeUpdate;
   let _onError;
   let __getLogData;
   let _unwatchHeading;
   let _unwatchPosition;

   /* ------------public properties------------ */
   // Setter used to store the callback in a private variable.
   // Because setting in a public property will arise a need of 
   // storing the self reference 'this' to a local variable (like self, that etc)
   // to access it from other scopes, like from a private function.
   Object.defineProperty(this, "_getLogData", {
      set: function (callback) {
         __getLogData = callback;
      }
   });

   /* -----------private methods------------- */
   function calculateAngleOfPhoneAndTarget(phoneAngle, angleWithUserAndTarget, tag) {
      let angle = phoneAngle < 90 ? phoneAngle + 270 : phoneAngle - 90; // convert north angle to east angle

      angle = angleWithUserAndTarget - angle; // phone angle wrt target

      // Make the degree equatlly divided to 0 to 180 and -1 to -180 wrt target
      if (angle > 180) angle = angle - 360;
      else if (angle < -180) angle = angle + 360;

      return -angle;
   }

   function calculateAngleWithUserAndTarget(myCoordinate, targetCoordinate) {
      let angle = Math.atan2(targetCoordinate.latitude - myCoordinate.latitude, targetCoordinate.longitude - myCoordinate.longitude) * (180 / Math.PI);
      if (angle < 0)
         angle = 360 + angle;

      return angle;
   }

   async function initGps() {
      let permission;

      try {
         permission = await Location.requestPermissionsAsync();
         if (!permission.granted) {
            if (_onError) {
               _onError({
                  denied: true,
                  message: 'Permission to access location was denied'
               });
            }

            return;
         }
      }
      catch (error) {
         if (_onError) {
            _onError({
               permissionError: true,
               message: 'Error occurred while getting GPS permission.',
               error
            });
         }
      }

      try {
         let location = await Location.getCurrentPositionAsync({})
         _angleOfUserAndTarget = calculateAngleWithUserAndTarget(location.coords, _TARGET_LAT_LON, 'getCurrentPositionAsync');
         if (__getLogData)
            passLogData('Got initial location data.');
      }
      catch (error) {
         if (_onError) {
            _onError({
               gpsError: true,
               message: 'Error occurred while getting position from GPS.',
               error
            });
         }
      }

      // Watch location
      try {
         _unwatchPosition = await Location.watchPositionAsync({
               accuracy: Location.Accuracy.Balanced,
               timeInterval: 10 * 1000,
               distanceInterval: 5 /* meters */
            },
            location => {
               _angleOfUserAndTarget = calculateAngleWithUserAndTarget(location.coords, _TARGET_LAT_LON);
               _angleOfPhoneAndTarget = calculateAngleOfPhoneAndTarget(_lastDegree, _angleOfUserAndTarget);
               _onDegreeUpdate(_angleOfPhoneAndTarget);

               if (__getLogData)
                  passLogData('Location updated.');
            }
         );
      }
      catch (error) {
         _onError({
            watchPositionError: true,
            message: 'Error occureed while watching GPS position.',
            error
         });
      }
   }

   async function initWatchHeading() {
      try {
         _unwatchHeading = await Location.watchHeadingAsync(obj => {
            _lastDegree = obj.magHeading;
            _angleOfPhoneAndTarget = calculateAngleOfPhoneAndTarget(obj.magHeading, _angleOfUserAndTarget);
            _onDegreeUpdate(_angleOfPhoneAndTarget);
         });
      }
      catch (error) {
         _onError({
            watchHeadingError: true,
            message: 'GPS watch heading error.',
            error
         });
      }
   }

   function passLogData(msg) {
      __getLogData({
         time: new Date().toLocaleTimeString(),
         message: msg,
         angleOfUserAndTarget: (_angleOfUserAndTarget || 0).toFixed(1),
         angleOfPhoneAndTarget: (_angleOfPhoneAndTarget || 0).toFixed(1),
         degree: (_lastDegree || 0).toFixed(1),
      });
   }

   /* -----------public methods------------- */
   this.watchAsync = async function (onDegreeUpdate, onError) {
      _onDegreeUpdate = onDegreeUpdate;
      _onError = onError;

      if (!_onDegreeUpdate) {
         throw Error('onDegreeUpdate handler is missing.');
      }

      if (__getLogData)
         passLogData('Waiting for GPS data...');

      await initGps();
      await initWatchHeading();
   };

   this.unwatch = function () {
      if (_unwatchPosition) _unwatchPosition.remove();
      if (_unwatchHeading) _unwatchHeading.remove();
   };
}

export default ZeroDegree;
