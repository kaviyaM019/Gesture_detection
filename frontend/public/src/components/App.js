import React, { useState, useEffect } from 'react';
import GestureComponent from './components/GestureComponent';
import axios from 'axios';
const App = () => {
    const [gesture, setGesture] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('http://localhost:8000/predict')
            .then(response => setGesture(response.data.gesture));
                  }, 2000);
                  return () => clearInterval(interval);
                }, []);
                return <GestureComponent gesture={gesture} />;
                };
                export default App;




