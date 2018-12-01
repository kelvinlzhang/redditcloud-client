import React, { Component } from 'react';
import './App.css';
import Chart from './chartComponents/Chart';
import data from "./chartComponents/data.json";

//REFERENCE FOR JSON PURPOSES:
// {'score': vs, 'vote': vote, 'timestamp': timestamp, 'word': word}

//

class ChartContainer extends Component {
  constructor(){
    super();
    this.state = {
      chartData:{},
      word: data.words[1].word, // this.props .. passed down from WordCloud
      x: data.words[1].timestamps,
      vote: data.words[1].vote, //need to calculate
      s: data.words[1].score, //score
    }
  }
  componentWillMount(){
    this.getChartData();
  }

  getChartData(){

    //CONVERT TIMESTAMP INTO READABLE DATES


    var time = this.state.x;
    var ts = [];
    ts.length = time.length;

    var i;


    //CALCULATE SENTIMENT

    //Range calculation:
    var beg = time[0];
    var end = time[time.length-1];
    var totalRange = end - beg;

    //round to nearest value divisible by 10 to get equal ranges
    if((totalRange % 10) != 0){
      totalRange += (10-(totalRange%10));
    }

    var unitRange = totalRange/10;

    var ranges = [];
    ranges.length = 11;

    ranges[0] = beg;
    for(i = 1; i < ranges.length; i++){
      ranges[i] = ranges[i-1] + unitRange;
    }

    console.log('bleep', end);
    console.log('bloop', ranges[10]);


    //time is the array with original timestamps

    var freq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var tbd = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    function divideSegments(ranges, t, v, sc){
      if(t >= ranges[0] && t < ranges[1]){
        freq[0]++;
        tbd[0] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[1] && t < ranges[2]){
        freq[1]++;
        tbd[1] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[2] && t < ranges[3]){
        freq[2]++;
        tbd[2] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[3] && t < ranges[4]){
        freq[3]++;
        tbd[3] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[4] && t < ranges[5]){
        freq[4]++;
        tbd[4] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[5] && t < ranges[6]){
        freq[5]++;
        tbd[5] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[6] && t < ranges[7]){
        freq[6]++;
        tbd[6] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[7] && t < ranges[8]){
        freq[7]++;
        tbd[7] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[8] && t < ranges[9]){
        freq[8]++;
        tbd[8] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[9] && t <= ranges[10]){
        freq[9]++;
        tbd[9] += (sc*v)/Math.abs(v);
      }

    }
    var sentiments = this.state.s;
    var votes = this.state.vote;
    for(i = 0; i < time.length; i++){
      divideSegments(ranges, time[i], votes[i], sentiments[i]);

    }

    //need to average out scores
    for(i = 0; i < tbd.length; i++){
      tbd[i] /= freq[i];
      console.log('boobs', freq[i], 'poops', tbd[i]);
    }

    // for(i = 0; i < freq.length; i++){
    //     console.log('freq', freq[i]);
    // }

    function tsConvert(unix){
      var input = new Date(unix * 1000);
      // var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = input.getFullYear();
      // var month = months[input.getMonth()];
      var month = input.getMonth();
      var date = input.getDate();
      var hour = input.getHours();
      var min = input.getMinutes();
      var sec = input.getSeconds();

      if(sec < 10){
        sec = '0' + sec;
      }
      var time = month + '/' + date + '/' + year + ', ' + hour + ':' + min + ':' + sec ;
      // var time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }

    var convertedRange = [];
    convertedRange.length = ranges.length;
    for(i = 0; i < ranges.length; i++){
      convertedRange[i] = tsConvert(ranges[i]);
      console.log('what you is', convertedRange[i]);
    }

    //SENTIMENT COLOR ASSIGNMENT

    var colors = [];
    colors.length = tbd.length;

    function sentColor(sent){
      if(sent <= -0.8){
        return "rgba(92, 10, 10, 1)";
      }
      else if(sent > -0.8 && sent <= -0.6){
        return "rgba(137, 15, 15, 1)";
      }
      else if(sent > -0.6 && sent <= -0.4){
          return "rgba(201, 16, 16, 1)";
      }
      else if(sent > -0.4 && sent <= -0.2){
        return "rgba(242, 140, 140, 1)";
      }
      else if(sent > -0.2 && sent <= 0){
          return "rgba(255, 230, 230, 1)";
      }
      else if(sent > 0 && sent <= 0.2){
        return "rgba(159, 237, 120, 1)";
      }
      else if(sent > 0.2 && sent <= 0.4){
          return "rgba(95, 224, 31, 1)";
      }
      else if(sent > 0.4 && sent <= 0.6){
        return "rgba(56, 132, 18, 1)";
      }
      else if(sent > 0.6 && sent <= 0.8){
          return "rgba(25, 73, 1, 1)";
      }
      else if(sent > 0.8 && sent <= 1){
        return "rgba(17, 50, 1, 1)";
      }
    }

    for(i = 0; i < tbd.length; i++){
      colors[i] = sentColor(tbd[i]);
    }

    this.setState({
      chartData:{
        labels: convertedRange.slice(0, 10),
        datasets:[
          {
            label: this.state.word,
            data:freq,
            backgroundColor: colors,
          }
        ]
      }
    });
  }

  render() {
    return (
      <div className="App">
        <Chart chartData={this.state.chartData} word={this.state.word} legendPosition="bottom"/>
      </div>
    );
  }
}

export default ChartContainer;
