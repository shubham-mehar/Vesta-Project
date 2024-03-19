import { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './App.css';

function App() {
  const [totalRequests, setTotalRequests] = useState(0);
  const [departmentNames, setDepartmentNames] = useState([]);
  const [requestPerHotel, setRequestPerHotel ] = useState({});
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
       type:'line',
        height: 350,
      },
      xaxis: {
        categories: [],
        labels: {
          rotate: 0, 
        }
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val % 2 === 0 ? val : '';
          },
        },
      }
    },
  });

  useEffect(() => {
    axios.get('https://checkinn.co/api/v1/int/requests')
      .then(response => {
        const data = response.data;
        setTotalRequests(data.requests.length);
        const departments = new Set();
        const hotelList = new Set();
        data.requests.forEach(request => {
          departments.add(request.desk.name);
          hotelList.add(request.hotel.name);
        });
        setRequestPerHotel(countRequestPerHotel(data.requests))
        setDepartmentNames(Array.from(departments));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  function countRequestPerHotel(requests){
    const counts = {};
    for(const req of requests){
      const hotelName = req.hotel.name;
      if(!counts[hotelName]) counts[hotelName]=1;
      else counts[hotelName]++;
    }  
    return counts;
  }

  useEffect(() => {
    const categories = Object.keys(requestPerHotel);
    const series = [{
      name: 'Total Requests',
      data: Object.values(requestPerHotel),
    }];
    setChartOptions({
      series,
      options: {
        chart: {
          type: 'line',
          height: 350,
        },
        xaxis: {
          categories: categories,
          labels: {
            rotate: 0, 
          },
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val % 2 === 0 ? val : ''; 
            },
          },
        },
      },
    });
  }, [requestPerHotel]);

  return (
    <div className="App">
      <div className="chart-container">
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type = {chartOptions.options.chart.type}  
          height={chartOptions.options.chart.height}
          width="100%"
        />
      </div>
      <div className="total-requests">Total requests: {totalRequests}</div>
      <div className="department-names">
        <p>List of <em>unique</em> department names across all Hotels:</p>
        <ul className="department-list">
          {departmentNames.map((department, index) => (
            <li key={index}>
              {department}
              {index < departmentNames.length - 1 && ', '}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;