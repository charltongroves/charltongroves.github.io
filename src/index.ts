import './styles.css'
import { StartYourEngines } from "./music_boy"
import { BooYah } from "./color_box"
const greeting: string = "Hello, TypeScript!";
console.log(greeting);

const letsPlay = () => {
  let cancelCurrent: undefined | (() => void) = undefined;
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
