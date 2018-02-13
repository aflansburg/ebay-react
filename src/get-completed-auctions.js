let axios = require('axios');

const EBAY_APP_ID = 'AbramFla-0959-4008-950d-e8abb475a969'; // <- replace with your own developer ID
// eBay base API request URL

let baseUri = "http://34.209.93.35:8080/http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems" +
    "&SERVICE-VERSION=1.7.0" +
    "&SECURITY-APPNAME=" + EBAY_APP_ID +
    "&RESPONSE-DATA-FORMAT=JSON" +
    "&REST-PAYLOAD" +
    "&itemFilter(0).name=Currency" +
    "&itemFilter(0).value=USD" +
    "&itemFilter(1).name=EndTimeFrom" +
    "&itemFilter(1).value=";


function initialApiCall(uri) {
  return axios.get(uri)
}

function getPageItems(uri, page) {
  return axios.get(uri + '&paginationInput.pageNumber=' + page)
}

async function getCompletedEbayItems(keywords, days, condition) {
    let conditionFilter;
    if (condition === 'New' || condition === 'Used'){
        conditionFilter = "&itemFilter(2).name=Condition&itemFilter(2).value="
            + condition;
    }
    else if (condition === 'Seller Refurbished'){
        conditionFilter = "&itemFilter(2).name=Condition&itemFilter(2).value=" + "2500";
    }
    else if (condition === 'Manufacturer Refurbished') {
        conditionFilter = "&itemFilter(2).name=Condition&itemFilter(2).value=" + "2000";
    }
    else {
        console.log('Defaulting condition to "Used" due to invalid parameter!');
        conditionFilter = "&itemFilter(3).name=Condition&itemFilter(3).value="
            + 'Used';
    }
  
  let timeframe = setTimeframe(days);
  baseUri = baseUri + timeframe + conditionFilter + "&keywords=";
  keywords = keywords.replace(/ /g, '%20');
  let uri = baseUri + keywords;
  console.log(`URI: ${uri}`);
  let responses = async() => {
    const returnedItems = initialApiCall(uri)
        .then(response => {
          let pageCount = response.data.findCompletedItemsResponse[0].paginationOutput[0].totalPages[0];
          // limit pagination to 50 from results
          if (pageCount > 50){ pageCount = 50 };
          
          // let totalItems = response.data.findCompletedItemsResponse[0].paginationOutput[0].totalEntries[0];
          // console.log('Total completed items: ' + totalItems);
          // console.log('Paginated results: ' + pageCount);
        
          let promiseArray = [];
          for (let i = 0; i < pageCount; i++) {
            let pageNum = i + 1;
            promiseArray.push(getPageItems(uri, pageNum));
          }
          return Promise.all(promiseArray);
        })
        .catch(err => {
          console.log(err)
        });
    return returnedItems;
  }
  return await responses();
}

function setTimeframe(days){
  let timeframe = new Date();
  timeframe.setDate((timeframe.getDate() - days));
  // console.log(`Searching eBay sales back to: ${timeframe.toLocaleString('en-US')}`);
  timeframe = timeframe.toISOString();
  return timeframe;
}
export {
  getCompletedEbayItems
}