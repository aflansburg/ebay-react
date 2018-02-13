import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import gear from './gear.svg';
import './App.css';
import * as dh from './data-helper';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <p className="App-h2">eBayAPI-React</p>
        </div>
        <p className="App-intro">
          This app is built on Facebook's React + Node.js (v8.5.0) and returns useful information from the eBay API regarding completed listings (with sales).
        </p>
      </div>
    );
  }
}

const initialState = {
    keywords: '',
    selectedOption: 'New',
    selectedType: 'Auction'
};

class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleConditionRadioChange = this.handleConditionRadioChange.bind(this);
      this.handleTypeRadioChange = this.handleTypeRadioChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange(event){
    this.setState({keywords: event.target.value});
  }
  handleConditionRadioChange(event){
    this.setState({selectedOption: event.target.value});
  }
  handleTypeRadioChange(event){
      this.setState({selectedType: event.target.value});
  }
  handleSubmit(event){
    ReactDOM.render(
        <div className="loading-msg">
          <img src={gear} className="loading-img" alt="loading-img" />
          <p>Loading.... this may take a while depending on the search parameters, please wait.....</p>
        </div>
        , document.getElementById('results-display'));
    ReactDOM.render(
        <div className="cancel-btn">
          <button className="w3-button w3-red" onClick={
            ()=>{
              ReactDOM.render(
                  <div className="loading-msg">
                    <img src={gear} className="loading-img" alt="loading-img" />
                    <p>Cancelling, please wait. If search was taking too long, try more keywords!</p>
                  </div>
                  , document.getElementById('results-display')
              );
              this.setState = initialState;
              window.location.reload();
            }
          }>Cancel
          </button>
    </div>, document.getElementById('search-form'));
    
    let keywords = this.state.keywords;
    let condition = this.state.selectedOption;
    let listingType = this.state.selectedType;
    
    let items = dh.thisDataHelper.getResults(keywords, 30, condition, listingType);
    items
        .then(response => {
          if (response){
            console.log(response);
            const analysis = dh.thisDataHelper.returnAnalysis(response);
            const resultsContent =
                <div className="w3-card-4">
        
                  <header className="w3-container w3-blue">
                    <h1>Results for "{analysis.keywords}"</h1>
                  </header>
        
                  <div className="w3-container">
                    <p># of Listings analyzed: {analysis.allItemsCount}</p>
                    <p>Total # of Sales: {analysis.qtySold}</p>
                    <p>Average Price: ${analysis.averagePrice.toFixed(2)}</p>
                    <p>Percent Sold: {analysis.percentSold}</p>
                    <p>Total $ Sold: ${analysis.totalSold.toFixed(2)}</p>
                    <p>Date Range: {analysis.dateRange}</p>
                  </div>
      
                </div>;
            ReactDOM.render(resultsContent, document.getElementById('results-display'));
            ReactDOM.render(
                <div className="cancel-btn">
                  <button className="w3-button w3-green"
                          onClick={()=>{
                            this.setState(initialState);
                            window.location.reload();
                          }}>
                    New Search
                  </button>
                </div>
                , document.getElementById('search-form'));
          }
          else {
            const analysis = dh.thisDataHelper.returnAnalysis(response);
            const possibleKeywords = getKeywordCombos(analysis.keywords);
            const keywordsList = possibleKeywords.map((keyword) => {
              return <li>{keyword}</li>
            });
            
            const noResultsContent =
                <div className="w3-card-4">
        
                  <header className="w3-container w3-blue">
                    <h1>No results found for "{analysis.keywords}"</h1>
                  </header>
        
                  <div className="w3-container">
                    <p>Try different keywords or less specific keywords.</p>
                    <p>For instance, instead of "{analysis.keywords}" perhaps try:</p>
                    <ul>{keywordsList}</ul>
                  </div>
      
                </div>;
            ReactDOM.render(noResultsContent, document.getElementById('results-display'));
            ReactDOM.render(
                <div className="cancel-btn">
                  <button className="w3-button w3-green"
                          onClick={()=>{
                            this.setState(initialState);
                            window.location.reload();
                          }}>
                    New Search
                  </button>
                </div>
                , document.getElementById('search-form'));
          }
        })
        .catch(err => {
          console.log(`Error: ${err}`);
        });
    event.preventDefault();
  }
  
  render(){
    return (
        <form id="searchForm" onSubmit={this.handleSubmit}>
          <label className="searchLabel">
            Search Keywords:
          </label>
          <input className="w3-input w3-border" type="text" value={this.state.keywords} onChange={this.handleInputChange} />
          <div className="condition-radio-pane">
              <h5>Condition</h5>
              <div className="radio-pane-inner">
            <input className="w3-radio" type="radio" name="condition" value="New"
                   checked={this.state.selectedOption ==='New'} onChange={this.handleConditionRadioChange} />
            <label>New</label>
            <input className="w3-radio" type="radio" name="condition" value="Used"
                   checked={this.state.selectedOption ==='Used'} onChange={this.handleConditionRadioChange} />
            <label>Used</label>
              <input className="w3-radio" type="radio" name="condition" value="Manufacturer Refurbished"
                     checked={this.state.selectedOption ==='Manufacturer Refurbished'} onChange={this.handleConditionRadioChange} />
              <label>Manufacturer Refurbished</label>
              <input className="w3-radio" type="radio" name="condition" value="Seller Refurbished"
                     checked={this.state.selectedOption ==='Seller Refurbished'} onChange={this.handleConditionRadioChange} />
              <label>Seller Refurbished</label>
              </div>
          </div>
          <div className="listingType-radio-pane">
              <h5>Listing Type</h5>
              <div className="radio-pane-inner-type">
              <input className="w3-radio" type="radio" name="listingType" value="Auction"
                     checked={this.state.selectedType ==='Auction'} onChange={this.handleTypeRadioChange} />
              <label>Auction</label>
              <input className="w3-radio" type="radio" name="listingType" value="Fixed"
                     checked={this.state.selectedType ==='Fixed'} onChange={this.handleTypeRadioChange} />
              <label>Fixed Price</label>
              </div>
          </div>
          <input className="w3-button w3-green" type="submit" value="Submit" />
          
        </form>
    );
  }
}

function getKeywordCombos(keywordString){
  const regex = /(?:\w+)/g;
  const str = keywordString;
  let m;
  let mArr = [];
  
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    
    // The result can be accessed through the `m`-variable.
    m.forEach((match) => {
      mArr.push(match);
    });
  }
  
  let len = mArr.length;
  
  function* keywordCombos(arr) {
    function* generateKeywords(offset, combo) {
      yield combo;
      for (let i = offset; i < arr.length; i++) {
        yield* generateKeywords(i + 1, combo.concat(arr[i]));
      }
    }
    yield* generateKeywords(0, []);
  }
  
  let genKeywords = [];
  for (let combo of keywordCombos(mArr)) {
    genKeywords.push(combo);
  }
  genKeywords = genKeywords.filter(n => {
    return n.length !== 0 && n.length !== len;
  });
  genKeywords = genKeywords.map(keyword=>{
    return keyword.join(' ');
    })
  return genKeywords;
}

export {App, NameForm};
