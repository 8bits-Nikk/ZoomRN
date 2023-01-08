import React, {useState} from 'react';
import {Button, StyleSheet, View, ActivityIndicator} from 'react-native';
import ZoomUs from 'react-native-zoom-us';
import {create} from 'apisauce';
import main from './startPersonalMeeting';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialize, setIsInitialize] = useState(false);

  const api = create({
    baseURL: 'https://d236-103-249-234-143.in.ngrok.io/',
  });

  const initializeZoom = async (sdkJwtToken: string) => {
    ZoomUs.initialize({jwtToken: `${sdkJwtToken}`})
      .then(initializeResult => {
        console.log({initializeResult});
        setIsInitialize(true);
        setIsLoading(false);
      })
      .catch(initializeError => {
        console.log('====================================');
        console.log(initializeError);
        console.log('====================================');
        setIsInitialize(false);
        setIsLoading(false);
      });
  };

  const getSDKToken = async () => {
    const res = await api.get('/v1/SDKToken');
    if (res.data) {
      return res.data?.SDKToken;
    }
    return '';
  };
  const getApiToken = async () => {
    const res = await api.get('/v1/ApiToken');
    if (res.data) {
      return res.data?.ApiToken;
    }
    return '';
  };

  const setMeetingData = async (data: {
    userId: string;
    meetingNumber: string;
    zoomAccessToken: string;
  }) => {
    try {
      await api.post('/v1/setMeetData', data);
    } catch (error) {
      console.log(error);
    }
  };

  const getMeetingData = async () => {
    const res = await api.get('/v1/getMeetData');
    if (res.data) {
      return res.data;
    }
    return {};
  };

  const onPress = async () => {
    setIsInitialize(false);
    setIsLoading(true);
    const token = await getSDKToken();
    console.log('==================SDK Token==================');
    console.log(token);
    console.log('====================================');
    await initializeZoom(token.toString());
  };

  const onPressJoin = async () => {
    const Meeting = await getMeetingData();
    await ZoomUs.joinMeeting({
      userName: 'App UserName',
      meetingNumber: Meeting?.meetingNumber,
      zoomAccessToken: Meeting?.zoomAccessToken,
    });
  };

  const onPressCreate = async () => {
    setIsLoading(true);
    const token = await getApiToken();
    console.log('================Token====================');
    console.log(token);
    console.log('====================================');
    main(token).then(async res => {
      await setMeetingData({
        userId: res.userId,
        meetingNumber: res.meetingNumber,
        zoomAccessToken: res.zoomAccessToken,
      });
      const start = await ZoomUs.startMeeting({
        userName: 'Dr. Tester',
        meetingNumber: res.meetingNumber,
        userId: res.userId,
        zoomAccessToken: res.zoomAccessToken,
      });

      console.log('===============Meeting Start=====================');
      console.log(start);
      console.log('====================================');
      setIsLoading(false);
    });
  };

  return (
    <View style={styles.body}>
      {isLoading ? (
        <ActivityIndicator />
      ) : isInitialize ? (
        <View style={styles.buttons}>
          <Button title="Join Meetting" onPress={onPressJoin} />
          <Button title="Create Meeting" onPress={onPressCreate} />
        </View>
      ) : (
        <Button title="Initialize" onPress={onPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    height: 100,
    justifyContent: 'space-between',
  },
});

export default App;
