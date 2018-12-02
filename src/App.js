import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import sketch from './sketch';
import ChartContainer from './ChartContainer';
import P5Wrapper from './P5Wrapper';

import './App.css';
import "react-datepicker/dist/react-datepicker.css";

const axios = require('axios');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subreddit: "",
      startDate: new Date(),
      endDate: new Date(),
      word: "",
      frequencies: {
        "RedditCloud": 25,
        "CS130": 15,
        "Kelvin Zhang": 5,
        "Karen Zhang": 5,
        "Vishaal Agartha": 5,
        "CJ Ordog": 5,
        "Anav Sanghvi": 5,
        "Albert Pan": 5
      },
      sentiments: {}
    };

    this.onChangeSubreddit = this.onChangeSubreddit.bind(this);
    this.onChangeStartDate = this.onChangeStartDate.bind(this);
    this.onChangeEndDate = this.onChangeEndDate.bind(this);
    this.onChangeSentimentChart = this.onChangeSentimentChart.bind(this);
  }

  onChangeSubreddit = (e) => {
    this.setState({ subreddit: e.target.value });
  }

  onChangeStartDate = (date) => {
    this.setState({ startDate: date });
  }

  onChangeEndDate = (date) => {
    this.setState({ endDate: date });
  }

  onChangeSentimentChart = (e) => {
    this.setState({ word: e.target.value });
  }

  onSubmit = (e) => {
    e.preventDefault();

    let data = JSON.stringify({
      subreddit: this.state.subreddit,
      start: parseInt((this.state.startDate.getTime() / 1000).toFixed(0)),
      end: parseInt((this.state.endDate.getTime() / 1000).toFixed(0))
    })

    axios.post('http://127.0.0.1:8080', data, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      },
      timeout: 60000
    })
    .then((res) => res.data)
    .then((data) => {
      var sentiments = Object.assign({}, ...data.map(({word, timestamps, score, vote}) => ({[word]: {timestamps, score, vote}})));
      var frequencies = data.reduce((map, obj) => (map[obj.word] = obj.frequency, map), {});

      this.setState({
        sentiments: sentiments,
        frequencies: frequencies
      });
    });
  }

  render() {
    return (
      <div className="App">
        <P5Wrapper sketch={sketch} dict={this.state.frequencies}/>
        <form onSubmit={this.onSubmit}>
          <input value={this.state.subreddit} onChange={this.onChangeSubreddit} />
          <DatePicker
            selected={this.state.startDate}
            onChange={this.onChangeStartDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="MM/d/yyyy h:mm aa"
          />
          <DatePicker
            selected={this.state.endDate}
            onChange={this.onChangeEndDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={5}
            dateFormat="MM/d/yyyy h:mm aa"
          />
          <button>Submit</button>
        </form>
        <input style={{display:"none"}} id="canvasForm" value="" onChange={this.onChangeSentimentChart}/>
        {typeof(this.state.sentiments[this.state.word]) !== "undefined" &&
          <ChartContainer 
            word={this.state.word} 
            ts={this.state.sentiments[this.state.word].timestamps} 
            vote={this.state.sentiments[this.state.word].vote} 
            s={this.state.sentiments[this.state.word].score}
          />
        }
      </div>
    );
  }
}

export default App;
