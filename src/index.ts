import './styles.css'
import { StartYourEngines } from "./music_boy"
import { BooYah } from "./color_box"
import {MBV} from './movement_based_vision'
import { CATS } from "./cat2"
import { BRIDJ } from './bridj'

const greeting: string = "Hello, TypeScript!";
console.log(greeting);

const pageToName: {[x: number]: string} = {
  0: 'home',
  1: 'booyah',
  2: 'MBV',
  3: 'cat'
}
const nameToPage: {[x: string]: number} = {
  'home': 0,
  'booyah': 1,
  'MBV': 2,
  'cat': 3
}


const letsPlay = () => {
  let cancelCurrent: undefined | (() => void) = undefined;
  const c = document.getElementById("myCanvas") as HTMLCanvasElement;
  // set canvas to height and width of viewport
  c.width = document.documentElement.clientWidth;
  c.height = document.documentElement.clientHeight;


  const nextButton = document.getElementById('next-button')
  const pages = [
    StartYourEngines,
    BooYah,
    MBV,
    CATS,
  ]
  // get page we're on from url
  const url = new URL(window.location.href);
  console.log(url)
  const pageName = url.searchParams.get('page') || 'home'
  if (pageName === 'bridj') {
    BRIDJ();
    return;
  }
  const page = nameToPage[pageName];
  let currentPage = page || 0;
  // when the next button is clicked, go to next page
  const handleClick = () => {
    currentPage = (currentPage + 1) % pages.length;
    // set url
    window.history.pushState({}, '', `?page=${pageToName[currentPage]}`);
    const page = pages[currentPage]
    if (cancelCurrent) {
      cancelCurrent();
    }
    cancelCurrent = page();
  }
  currentPage -= 1;
  handleClick();
  nextButton?.addEventListener('click', handleClick)
}

letsPlay();
