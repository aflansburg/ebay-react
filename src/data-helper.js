import * as g from './get-completed-items';

let analysis = {};

const thisDataHelper = {
  
  name: 'dataHelper',
  getResults: function (keywords, days, condition) {
    if (days > 30){
      // findCompletedItems call does not seem to return much useful
      // data 30 days back from current date.
      console.log(`Timeframe of ${days} days exceeds` +
      `threshold for useful data return, setting to 30 days.`);
      days = 30;
    }
    
    let results = filteredResults(keywords, days, condition)
        .then(items => {
          if (items.length === 0){
            console.log('No items were found')
            return
          }
          else {
            return items;
          }
        })
        .catch(err => {
          console.log(err)
        });
    return results;
  },
  returnAnalysis: (items) => {
    
    let total = 0;
    if (items === undefined){
      analysis.results = 'No items returned -- try different keywords'
      return analysis
    }
    items.map(item => {
      let itemPrice = Number(parseFloat(item.sellingStatus[0].convertedCurrentPrice[0].__value__).toFixed(2));
      total += itemPrice
    });
    let mean = total/items.length;
    // formatting
    // total = total.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    // mean = mean.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    
    
    analysis.averagePrice = Number(parseFloat(mean).toFixed(2));
    analysis.totalSold = Number(parseFloat(total).toFixed(2));
    analysis.qtySold = items.length;
    analysis.percentSold = (parseFloat(analysis.qtySold/analysis.allItemsCount)*100)
                            .toFixed(2) + '%';
    
    return analysis;
  }
};

async function filteredResults(keywords, days, condition) {
  analysis.keywords = keywords;
  const results = g.getCompletedEbayItems(keywords, days, condition);
  let items = [];
  await results.then(data=>{
    // getting back a lot of garbage with certain searches from eBay API
    // this checks for undefined object
    if (data !== undefined){
      data = data.map(item => {
        if (item.data.findCompletedItemsResponse[0].searchResult !== undefined)
          return item.data.findCompletedItemsResponse[0].searchResult[0].item;
      });
    }
    if (data.length === 0)
      return
    data = data.reduce((a,b)=>{
      return a.concat(b);
    });
    analysis.allItemsCount = data.length;
    // console.log('# of unfiltered items: ' + data.length);
    
    analysis.dateRange = prettyprintDate(days);
    
    data.map(item => {
      // getting back a lot of garbage with certain searches from eBay API
      // this checks for undefined object
      if (item !== undefined){
        // let saleDate = item.listingInfo[0].endTime[0];
        // saleDate = parseDate(saleDate);
        // console.log(`item saleDate: ${saleDate}`)
        if (item.sellingStatus[0].sellingState[0] === 'EndedWithSales') {
          items.push(item);
        }
      }
    });
  })
      .catch(err=>{console.log(err)});
  // console.log('# of sold items: ' + items.length);
  return items;
}

// function parseDate(dateString){
//   return new Date(Date.parse(dateString)).toISOString();
// }

function prettyprintDate(days){
  
  let options = {timeZone: 'America/Chicago'} // set timeZone using IANA tz
  let curr = new Date(), prev = new Date();
  
  prev.setDate((prev.getDate() - days));
  prev = prev.toLocaleString('en-US', options);
  
  curr.setDate(curr.getDate());
  curr = curr.toLocaleString('en-US', options);
  
  const regex = /.*(?=,)/g;
  let match = [prev, curr].map(i=>{
        let m = regex.exec(i);
        regex.lastIndex = 0;
        return m[0]
      }
  );
  
  return match[0] + ' - ' + match[1];
}

export {
  thisDataHelper
}