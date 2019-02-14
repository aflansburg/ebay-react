import * as g from './get-completed-auctions';
import * as f from './get-completed-fixed';
let outliers = require('outliers');

let analysis = {};
let options = {
    listingType: 'FixedPrice' // can alternatively be 'Auction' and/or 'AuctionWithBIN'
};

const thisDataHelper = {
  
  name: 'dataHelper',
  getResults: function (keywords, days, condition, listingType) {
    // limit search to 30 days for relevancy and expediency
    // if (days > 30){
    //   console.log(`Timeframe of ${days} days exceeds` +
    //   `threshold for useful data return, setting to 30 days.`);
    //   days = 30;
    // }
    
    let results = filteredResults(keywords, days, condition, listingType)
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
    
    if (items === undefined){
      analysis.results = 'No items returned -- try different keywords'
      return analysis
    }
    let validatedSets = [];

    items.forEach(item => {
      let itemPrice = Number(parseFloat(item.sellingStatus[0].convertedCurrentPrice[0].__value__).toFixed(2));
      // omit titles with the word lot - price is not added to totalx`
      if (!item.title[0].toLowerCase().includes('lot')){
        validatedSets.push({title: item.title[0], price: itemPrice})
      }
    });
    let trimmedPrices = validatedSets.filter(outliers('price'));

    const getTotal = (items, prop) => {
      return items.reduce( (a, b) =>{
        return a + b[prop];
      }, 0);
    };

    let total = getTotal(trimmedPrices, 'price');
    // let total = validatedSets.reduce((sum, x,)=> sum + x);

    let mean = total/items.length;

    analysis.averagePrice = Number(parseFloat(mean).toFixed(2));
    analysis.totalSold = Number(parseFloat(total).toFixed(2));
    analysis.qtySold = items.length;
    analysis.percentSold = (parseFloat(analysis.qtySold/analysis.allItemsCount)*100)
                            .toFixed(2) + '%';
    
    return analysis;
  }
};

async function filteredResults(keywords, days, condition, listingType) {
  analysis.keywords = keywords;
  let results = '';
  if (listingType === 'Auction'){
      results = g.getCompletedEbayItems(keywords, days, condition);
  }
  else if (listingType === 'Fixed'){
    results = f.getCompletedFixedPrice(keywords, days, condition);
  }

  let items = [];
  await results.then(data=>{
    // getting back a lot of garbage with certain searches from eBay API
    // this checks for undefined object
    console.log(keywords);
    if (data !== undefined){
      data = data[0].data.findCompletedItemsResponse[0].searchResult[0].item;
      data = data.map(item => {
        let title = item.title[0].toLowerCase().split(' ');
        let vKeywords = keywords.toLowerCase().split(' ');
        let matchCount = []

        title.forEach(w => vKeywords.includes(w) && matchCount.push(w))

        // not crazy about this fuzzy matching method -- need better fuzzy match/search validation
        if (item !== undefined && matchCount.length > 0)
          return item;
      });
    }
    if (data.length === 0)
      return
    // data = data.reduce((a,b)=>{
    //   return a.concat(b);
    // });
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