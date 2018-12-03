var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder().forBrowser('firefox').build();
driver.get('https://kelvinlzhang.github.io/redditcloud-client/');


//inputs subreddit into field
driver.findElement(By.tagName('input')).sendKeys('nba');

//select date range
// driver.findElement(By.className('input')).sendKeys('12/2/2018 12:00 AM');
driver.findElement(By.className('react-datepicker-ignore-onclickoutside')).sendKeys('12/2/2018 12:10 AM');
//submit
