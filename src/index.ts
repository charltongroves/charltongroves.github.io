import './styles.css'
import { StartYourEngines } from "./music_boy"
import { BooYah } from "./color_box"
const greeting: string = "Hello, TypeScript!";
console.log(greeting);

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
  let currentPage = 0;
  homePage();
  // when the next button is clicked, go to next page
  const handleClick = () => {
    currentPage = currentPage === 0 ? 1 : 0;
    if (currentPage === 0) {
      homePage();
    } else {
      secondPage();
    }
  }
  nextButton?.addEventListener('click', handleClick)
}

letsPlay();
