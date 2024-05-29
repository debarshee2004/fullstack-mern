import { useEffect, useState } from "react";

/**
 * Custom hook for fetching currency information.
 * This hook utilizes useState and useEffect to fetch currency data upon initial render and upon currency change.
 * It fetches data from the CURRENCY API, parses the response, and returns the relevant currency information.
 *
 * @param {string} currency - The currency code for which information is to be fetched.
 * @returns {object} - Currency information object.
 */

function useCurrencyInfo(currency) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${currency}.json`
        );
        const jsonData = await response.json();
        setData(jsonData[currency]);
      } catch (error) {
        console.error("Error fetching currency data:", error);
      }
    };
    fetchData();
  }, [currency]);
  return data;
}

export default useCurrencyInfo;
