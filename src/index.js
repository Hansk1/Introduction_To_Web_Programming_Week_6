import "./styles.css";
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

//Get new data:
async function getData(areaCode) {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  //Modify jsonQuery with area code:
  jsonQuery.query[1].selection.values[0] = areaCode;

  //console.log(jsonQuery);

  //Fetch the data (POST):
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });
  if (!res.ok) {
    return;
  }
  const data = await res.json();

  //console.log(data);
  return data;
}

//Buld the chart:
const buildChart = async (data) => {
  //console.log(data)

  const area = Object.values(data.dimension.Alue.category.label);
  const labels = Object.values(data.dimension.Vuosi.category.label);
  const values = data.value;

  //console.log(area);
  //console.log(labels);
  //console.log(values);

  const dataArray = [
    {
      name: area,
      values: values
    }
  ];

  const chartData = {
    labels: labels,
    datasets: dataArray
  };

  //Create the chart usin all the data:
  const chart = new Chart("#chart", {
    title: "Asukasluvun kasvu",
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"],
    lineOptions: {
      hideDots: 1,
      regionFill: 0
    }
  });
};

//Get form and listen for new submit:
const submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", async function () {
  const inputArea = document.getElementById("input-area");

  //Make the first letter always uppercase:
  const areaName =
    inputArea.value.charAt(0).toUpperCase() + inputArea.value.slice(1);

  //If area code field was empty:
  if (!areaName) return;

  //Get areacode using area name:
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const dataPromise = await fetch(url);
  const dataJson = await dataPromise.json();

  console.log(dataJson);
  console.log(areaName);

  //Get index of area:
  const areaIndex = dataJson.variables[1].valueTexts.indexOf(areaName);

  //get the areacode using the index:
  const areaCode = dataJson.variables[1].values[areaIndex];

  //get data for chart:
  const chartData = await getData(areaCode);

  //If we dont get data:
  if (!chartData) return;

  buildChart(chartData);
});

//Get data(pageLoad):
async function getDataOnLoad() {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  //Fetch the data (POST):
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });
  if (!res.ok) {
    return;
  }
  const data = await res.json();

  //console.log(data);
  return data;
}

//On page load, load default data:
async function loadDataOnPageLoad() {
  const defaultData = await getDataOnLoad();
  buildChart(defaultData);
}

loadDataOnPageLoad();
