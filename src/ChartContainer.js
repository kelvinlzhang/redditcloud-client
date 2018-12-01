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
      word: data.words[2].word, // this.props .. passed down from WordCloud
      ts: data.words[2].timestamps,
      vote: data.words[2].vote,
      s: data.words[2].score,
    }
  }
  componentWillMount(){
    this.getChartData();
  }

  getChartData(){

    //////////////////////////////////////////
    //VARIABLES THAT WILL BE USED THROUGHOUT//
    /////////////////////////////////////////

    var time = this.state.ts;
    var sentiments = this.state.s;
    var votes = this.state.vote;
    var i;  //iterator for loops

    //////////////////////
    //RANGE CALCULATION//
    ////////////////////

    var beg = time[0];
    var end = time[time.length-1];
    var totalRange = end - beg;

    //round to nearest value divisible by 10 to get equal ranges
    if((totalRange % 10) != 0){
      totalRange += (10-(totalRange%10));
    }

    var ranges = [];
    ranges.length = 11;

    ranges[0] = beg;
    for(i = 1; i < ranges.length; i++){
      ranges[i] = ranges[i-1] + (totalRange/10);
    }

    ///////////////////////////////////////
    //FREQUENCY AND SENTIMENT CALCULATION//
    //////////////////////////////////////

    var freq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //holds how often a word appears per time range
    var calcSent = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //hold final calculations for sentiment values to be displayed

    function divideSegments(ranges, t, v, sc){
      if(t >= ranges[0] && t < ranges[1]){
        freq[0]++;
        calcSent[0] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[1] && t < ranges[2]){
        freq[1]++;
        calcSent[1] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[2] && t < ranges[3]){
        freq[2]++;
        calcSent[2] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[3] && t < ranges[4]){
        freq[3]++;
        calcSent[3] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[4] && t < ranges[5]){
        freq[4]++;
        calcSent[4] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[5] && t < ranges[6]){
        freq[5]++;
        calcSent[5] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[6] && t < ranges[7]){
        freq[6]++;
        calcSent[6] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[7] && t < ranges[8]){
        freq[7]++;
        calcSent[7] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[8] && t < ranges[9]){
        freq[8]++;
        calcSent[8] += (sc*v)/Math.abs(v);
      }
      else if(t >= ranges[9] && t <= ranges[10]){
        freq[9]++;
        calcSent[9] += (sc*v)/Math.abs(v);
      }

    }

    for(i = 0; i < time.length; i++){
      divideSegments(ranges, time[i], votes[i], sentiments[i]);
    }

    //average out all the summed sentiments per range
    for(i = 0; i < calcSent.length; i++){
      calcSent[i] /= freq[i];
      console.log('freq: ', freq[i], 'sent: ', calcSent[i]);
    }

    ////////////////////
    //DATE FORMATTING//
    //////////////////

    function tsConvert(unix){
      var input = new Date(unix * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = input.getFullYear();
      var month = months[input.getMonth()];
      var date = input.getDate();
      var hour = input.getHours();
      var min = input.getMinutes();
      var sec = input.getSeconds();

      if(sec < 10){
        sec = '0' + sec;
      }

      var time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }

    var convertedRange = [];
    convertedRange.length = ranges.length;

    for(i = 0; i < ranges.length; i++){
      convertedRange[i] = tsConvert(ranges[i]);
    }

    ///////////////////////////////
    //SENTIMENT COLOR ASSIGNMENT//
    /////////////////////////////

    var colors = [];
    colors.length = calcSent.length;

    function sentColor(sent){
      if(sent <= -0.9){
        return "rgba(45, 6, 6, 1)";
      }
      else if(sent > -0.9 && sent <= -0.8){
        return "rgba(62, 8, 8, 1)";
      }
      else if(sent > -0.8 && sent <= -0.7){
          return "rgba(92, 10, 10, 1)";
      }
      else if(sent > -0.7 && sent <= -0.6){
        return "rgba(112, 15, 15, 1)";
      }
      else if(sent > -0.6 && sent <= -0.5){
        return "rgba(135, 18, 18, 1)";
      }
      else if(sent > -0.5 && sent <= -0.4){
          return "rgba(157, 21, 21, 1)";
      }
      else if(sent > -0.4 && sent <= -0.3){
        return "rgba(180, 24, 24, 1)";
      }
      else if(sent > -0.3 && sent <= -0.2){
          return "rgba(202, 28, 28, 1)";
      }
      else if(sent > -0.2 && sent <= -0.1){
        return "rgba(224, 31, 31, 1)";
      }
      else if(sent > -0.1 && sent <= 0){
          return "rgba(234, 98, 98, 1)";
      }
      else if(sent > 0 && sent <= 0.1){
        return "rgba(56, 132, 18, 1)";
      }
      else if(sent > 0.1 && sent <= 0.2){
          return "rgba(171, 251, 132, 1)";
      }
      else if(sent > 0.2 && sent <= 0.3){
        return "rgba(105, 247, 34, 1)";
      }
      else if(sent > 0.3 && sent <= 0.4){
          return "rgba(79, 221, 8, 1)";
      }
      else if(sent > 0.4 && sent <= 0.5){
        return "rgba(70, 197, 7, 1)";
      }
      else if(sent > 0.5 && sent <= 0.6){
          return "rgba(62, 172, 6, 1)";
      }
      else if(sent > 0.6 && sent <= 0.7){
        return "rgba(44, 124, 4, 1)";
      }
      else if(sent > 0.7 && sent <= 0.8){
          return "rgba(35, 99, 3, 1)";
      }

      else if(sent > 0.8 && sent <= 0.9){
          return "rgba(26, 75, 2, 1)";
      }
      else if(sent > 0.9 && sent <= 1){
        return "rgba(17, 50, 1, 1)";
      }
    }

    for(i = 0; i < calcSent.length; i++){
      colors[i] = sentColor(calcSent[i]);
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
