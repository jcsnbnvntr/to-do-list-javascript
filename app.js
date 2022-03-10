const inputElement = document.getElementById("text-input");
const addButton = document.getElementById("add-btn");
const clearButton = document.getElementById("clr-btn");
const list = document.getElementById("to-do-list");

// Elements under navigation
const nav = document.querySelector(".navigation");
const burgerMenu = document.querySelector(".burger");
const toDoButton = document.getElementById("to-do-btn");
const trashBin = document.getElementById("trash-btn");
const overlay = document.querySelector(".overlay");

//  Classes
const CHECK = "circle fas fa-check-circle";
const UNCHECK = "circle far fa-circle";
const LINE_THROUGH = "linethrough";

//  Variables
let toDoList = [];
let itemsOnTrash = 0;

// Accessing items from local storage
let data = localStorage.getItem("To Do List");

// To check if 'To Do List' exist on local storage
if (data) {
  toDoList = JSON.parse(data);
  let trashed = 0;

  // Updating to-do list in the user interface
  toDoList.forEach((element) => {
    addToDo(element.id, element.content, element.completed, element.trash);
    if (element.trash) itemsOnTrash++;
  });

  if (toDoList.length === itemsOnTrash) {
    addEmptyState("todo");
  }
} else {
  addEmptyState("todo");
}

// Event Listeners
addButton.addEventListener("click", () => {
  if (isContentEmpty(inputElement.value)) return;

  addToDo(toDoList.length.toString(), inputElement.value, false, false);

  toDoList.push({
    id: toDoList.length.toString(),
    content: inputElement.value,
    completed: false,
    trash: false,
  });

  // Storing array to local storage
  localStorage.setItem("To Do List", JSON.stringify(toDoList));
  inputElement.value = "";
});

// To clear local storage
clearButton.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// target the items created dynamically (Items that doesn't exist yet)
list.addEventListener("click", (ev) => {
  let element = ev.target;
  let classes = element.classList;

  if (classes.contains("circle")) {
    completeToDo(element);
  }
  if (classes.contains("fa-trash-alt") || classes.contains("fa-sync")) {
    removeToDo(element);
  }

  // Storing array to local storage
  localStorage.setItem("To Do List", JSON.stringify(toDoList));
});

// To open or close navigation bar using burger menu
burgerMenu.addEventListener("click", (ev) => {
  nav.classList.toggle("nav-active");

  // For burger menu animation
  burgerMenu.classList.toggle("close");

  // To open or close side navigation
  navSlide();

  // Adding overlay on list when navigation is open
  overlay.classList.toggle("focus-out");

  // Adding new classname to disable pointer events when nav is open
  list.parentElement.classList.toggle("freeze");
});

trashBin.addEventListener("click", () => {
  let trashList = [];

  overlay.classList.toggle("focus-out");
  list.parentElement.classList.toggle("freeze");
  removeEmptyState();

  // Converting HTML Collections to array
  Array.from(list.children).forEach((item) => {
    list.removeChild(item);
  });

  nav.classList.toggle("nav-active");
  // Burger menu animation
  burgerMenu.classList.toggle("close");
  // To open or close side navigation
  navSlide();

  toDoButton.classList.toggle("active");
  trashBin.classList.toggle("active");

  // Filtering objects with a property trash = true and return to trashList array
  trashList = toDoList.filter((item) => {
    if (item.trash == true) {
      return item;
    }
  });

  if (trashList.length === 0) {
    addEmptyState("trash");
  } else {
    // To display the trashList on the user interface
    trashList.forEach((item) => {
      addToTrashList(item.id, item.content, item.completed);
    });
  }
});

toDoButton.addEventListener("click", () => {
  nav.classList.toggle("nav-active");
  burgerMenu.classList.toggle("close"); // Burger menu animation
  navSlide(); // To open or close side navigation

  location.reload(); // refresh page
});

// functions

// To check if the user input is empty
function isContentEmpty(text) {
  return text.trim() == "";
}

// To display items on the user intaerface
function addToDo(id, content, completed, trash) {
  const COMPLETE = completed ? CHECK : UNCHECK;
  const DONE = completed ? LINE_THROUGH : "";
  let emptyState = document.querySelector(".empty-state-container");

  // If trash == true, execution will be cancelled (It will not appear to the user interface)
  if (trash) return;
  // If empty state exists
  if (emptyState) removeEmptyState();

  // This HTML Elements will append inside the <ul>
  let markUp = `
  <li>
    <p class="content ${DONE}">${content}</p>
    <i class="${COMPLETE}" id="${id}"></i>
    <i class="fas fa-trash-alt" id="${id}"></i>
  </li>
  `;

  // This will append the HTML Element inside the list
  list.insertAdjacentHTML("beforeend", markUp);
}

// To mark the item as completed
function completeToDo(element) {
  let classes = element.classList;
  if (classes.contains("fa-circle")) {
    element.classList = CHECK;
    element.parentNode.querySelector(".content").classList.toggle(LINE_THROUGH);
  } else if (classes.contains("fa-check-circle")) {
    element.classList = UNCHECK;
    element.parentNode.querySelector(".content").classList.toggle(LINE_THROUGH);
  }
  // Assigning completed to true if it's false, otherwise set to flase if it's true
  toDoList[element.id].completed = toDoList[element.id].completed
    ? false
    : true;
}

function removeToDo(element) {
  // value of trash =  true, it will set to false then vice versa
  toDoList[element.id].trash = toDoList[element.id].trash ? false : true;

  // Animation
  element.parentElement.classList.add("swipe-left");

  // Removing the whole list item of selected element after the end of previous transition
  element.parentElement.addEventListener("transitionend", function () {
    element.parentNode.parentNode.removeChild(element.parentNode);
  });

  if (element.classList.contains("fa-trash-alt")) {
    itemsOnTrash++;
    if (toDoList.length === itemsOnTrash) {
      element.parentElement.addEventListener("transitionend", function () {
        addEmptyState("todo");
      });
    }
  } else if (element.classList.contains("fa-sync")) {
    itemsOnTrash--;
    if (itemsOnTrash === 0) {
      element.parentElement.addEventListener("transitionend", function () {
        addEmptyState("trash");
      });
    }
  }
}

// Fade in animation for each nav link
function navSlide() {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link, index) => {
    if (link.style.animation) link.style.animation = "";
    else
      link.style.animation = `navLinkFadeIn 500ms ease forwards ${
        index / 5 + 0.5
      }s`;
  });
}

function addToTrashList(id, content, completed) {
  let DONE = completed ? LINE_THROUGH : "";

  // This HTML Elements will append inside the <ul>
  let markUp = `
  <li>
    <p class="content ${DONE}">${content}</p>
    <i class="fas fa-sync" id="${id}"></i>
  </li>
  `;

  // This will append the HTML Element inside the list
  list.insertAdjacentHTML("beforeend", markUp);
}

function addEmptyState(loc) {
  let emptyStateContainer = `
    <div class="empty-state-container">
      <div class="${
        loc == "todo" ? "todo-empty-state" : "trash-empty-state"
      }"></div>
      <p>${
        loc == "todo"
          ? "You don't have any to-do list yet"
          : "No to-do list in trash"
      }</p>
    </div>
  `;

  list.parentElement.insertAdjacentHTML("afterbegin", emptyStateContainer);
}

function removeEmptyState() {
  let targetElement = document.querySelector(".empty-state-container");
  if (targetElement) {
    let emptyState = targetElement;
    list.parentElement.removeChild(emptyState);
  }
}
