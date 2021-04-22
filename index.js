import * as Location from 'expo-location';

function ZeroDegree(targetLatLon, _additionalInfoCallback) {
   /* -----------private variables------------- */
   let _TARGET_LAT_LON = targetLatLon;
   let _angleOfUserAndTarget;
   let _angleOfPhoneAndTarget
   let _updateDegree;
   let _onError;
   let _unwatchHeading;
   let _unwatchPosition;

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
      let angle = Math.atan2(targetCoordinate.lat - myCoordinate.latitude, targetCoordinate.lon - myCoordinate.longitude) * (180 / Math.PI);
      if (angle < 0)
         angle = 360 + angle;

      return angle;
   }

   async function initGps() {
      let permission;

      try {
        permission = await Location.requestPermissionsAsync();
        if (!permission.granted) {
            _onError({ denied: true, message: 'Permission to access location was denied' });
            return;
        }
      }
      catch(err) {
          _onError({
            permissionError: true,
            message: 'Error occurred while getting GPS permission. [' + err + ']'
          });
      }

      try {
        let location = await Location.getCurrentPositionAsync({})    
        _angleOfUserAndTarget = calculateAngleWithUserAndTarget(location.coords, _TARGET_LAT_LON, 'getCurrentPositionAsync');
        _additionalInfoCallback('Got initial position. ' + new Date().toLocaleTimeString());
      }
      catch(err) {
         _onError({ gpsError: true, message: 'Error occurred while getting position from GPS.' });
      }

      // Watch location
      try {
        _unwatchPosition = await Location.watchPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 2000,
              distanceInterval: 5 /* meters */
          },
          location => {
              _angleOfUserAndTarget = calculateAngleWithUserAndTarget(location.coords, _TARGET_LAT_LON);
              _angleOfPhoneAndTarget = calculateAngleOfPhoneAndTarget(_angleOfPhoneAndTarget, _angleOfUserAndTarget);
              _updateDegree(_angleOfPhoneAndTarget);
              
              _additionalInfoCallback(new Date().toLocaleTimeString() + ' Got new position. Angle between user and target ' + _angleOfUserAndTarget);
          }
        );
      }
      catch(err) {
        _onError({
            watchPositionError: true,
            message: 'Error occureed while watching GPS position [' + err + ']'
          });
      }
   }

   async function initWatchHeading() {
     try {
      _unwatchHeading = await Location.watchHeadingAsync(obj => {
          _angleOfPhoneAndTarget = calculateAngleOfPhoneAndTarget(obj.magHeading, _angleOfUserAndTarget);
          _updateDegree(_angleOfPhoneAndTarget);
        });
     }
     catch(err) {
      _onError({ watchHeadingError: true, message: 'GPS watch heading error. [' + err + ']' });
    }
   }

   /* -----------public methods------------- */
   this.watch = async function(updateDegree, onError) {
     _updateDegree = updateDegree;
     _onError = onError;

     _additionalInfoCallback('Waiting to get location data...');
     
    await initGps();
    await initWatchHeading();
   };

   this.unwatch = function() {
    if(_unwatchPosition) _unwatchPosition.remove();
    if(_unwatchHeading) _unwatchHeading.remove();

    //alert('unwatch ' + typeof _unwatchPosition.remove + ' ' + typeof _unwatchHeading);
   };
}

export default ZeroDegree;
