import React, { useState } from 'react';
import styles from './Home.module.css';

function Home() {

    const [data, setData] = useState(null);
   
    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

    const fetchData = async () => {
        try {
          let response = await fetch('https://us-central1-charlie-website-2550b.cloudfunctions.net/getPosts');
          let result = await response.json();
          setData(result);
        } catch (error) {
          console.error("There was an error fetching the data:", error);
        }
      };

    return (
        <div>
            <button className={styles.button} onClick={logout}>Logout</button>
            <button onClick={fetchData}>Fetch Data</button>
            {data && (
        <div>
          <h3>Output:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Home;
