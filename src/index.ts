import './styles.css'
import { StartYourEngines } from "./music_boy"
import { BooYah } from "./color_box"
import {MBV} from './movement_based_vision'
const greeting: string = "Hello, TypeScript!";
console.log(greeting);

const pageToName: {[x: number]: string} = {
  0: 'home',
  1: 'booyah',
  2: 'MBV'
}
const nameToPage: {[x: string]: number} = {
  'home': 0,
  'booyah': 1,
  'MBV': 2
}
const letsPlay = () => {
  let cancelCurrent: undefined | (() => void) = undefined;
  const c = document.getElementById("myCanvas") as HTMLCanvasElement;
  // set canvas to height and width of viewport
  c.width = document.documentElement.clientWidth;
  c.height = document.documentElement.clientHeight;


  const nextButton = document.getElementById('next-button')
  const homePage = () => {
    cancelCurrent?.()
    cancelCurrent = StartYourEngines()
  }
  const secondPage = () => {
    cancelCurrent?.()
    cancelCurrent = BooYah()
  }
  const thirdPage = () => {
    cancelCurrent?.()
    cancelCurrent = MBV()
  }
  // get page we're on from url
  const url = new URL(window.location.href);
  console.log(url)
  const page = nameToPage[url.searchParams.get('page') || 'home'];
  let currentPage = [1,2,3,4,5].includes(page) ? page : 0;
  // when the next button is clicked, go to next page
  const handleClick = () => {
    currentPage = (currentPage + 1) % 3;
    // set url
    window.history.pushState({}, '', `?page=${pageToName[currentPage]}`);
    if (currentPage === 0) {
      homePage();
    } else if (currentPage === 1){
      secondPage();
    } else {
      thirdPage();
    }
  }
  currentPage -= 1;
  handleClick();
  nextButton?.addEventListener('click', handleClick)
}

letsPlay();
