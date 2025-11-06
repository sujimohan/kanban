//alert class
const notyf = new Notyf({
    duration: 3000,
    position: { x: "center", y: "bottom" },
    types: [
        // Keep default success style
        {
            type: "success",
            background: "#4BB543",
            icon: { className: "fas fa-check-circle", tagName: "i" },
        },
        // Keep default error style
        {
            type: "error",
            background: "#FF4C4C",
            icon: { className: "fas fa-times-circle", tagName: "i" },
        },
        // Add your custom warning
        {
            type: "warning",
            background: "#ffcc00",
            className: "notyf-warning-custom",
            icon: { className: "fas fa-exclamation-triangle", tagName: "i" },
        },
    ],
});

//VARIABLE DECLARATION - DOM ELEMENTS
let addBtn = document.querySelector(".add-btn"); // + button
let removeBtn = document.querySelector(".remove-btn"); // X button
let deleteMessage = document.querySelector("#message_delete"); //  button
let modalCont = document.querySelector(".modal-cont"); //pop up modal
let toolBoxColors = document.querySelectorAll(".color");
let mainCont = document.querySelector(".main-cont"); //tickets listed
let taskArea = document.querySelector(".textArea-cont"); //task edit
let allPriorityColors = document.querySelectorAll(".priority-color");

//VARIABLE DECLARATION - FLAGs
let addFlag = false;
let ticketsArr = [];
let colors = ["lightpink", "lightgreen", "lightblue", "black"];
let modalPriorityColor = colors[0];
let selectedFilterColor = "none";
let ticketID = 0;
let removeTaskFlag = false;
let lockClose = "fa-lock";
let lockOpen = "fa-lock-open";

//onload get the localstorage and display the ticket
if (localStorage.getItem("tickets")) {
    ticketsArr = JSON.parse(localStorage.getItem("tickets"));
    ticketsArr.forEach((ticket) => {
        createTicket(ticket.ticketColor, ticket.ticketID, ticket.ticketTask);
    });
}

//Filter the tickets based on the filter selected;
//Filter the tickets based on the selection based on the double click on Toolbox
toolBoxColors.forEach((toolboxColor) => {
    //Single click show/filter
    toolboxColor.addEventListener("click", function () {
        let ticketFound = false;
        let selectedColor = toolboxColor.classList[0];
        // remove highlight from all
        document
            .querySelectorAll(".color")
            .forEach((c) => c.classList.remove("selected-color"));
        toolboxColor.classList.add("selected-color");
        // select all the tickets
        let allTickets = document.querySelectorAll(".ticket-cont");
        if (allTickets.length == 0) {
            notyf.open({
                type: "warning",
                message: "No tickets found. Please add a new one!",
            });
            return;
        }
        //  loop throught each ticket
        allTickets.forEach((eachTicket) => {
            //get the color in band
            const ticketColor = eachTicket.style
                .getPropertyValue("--ticket-color")
                .trim();

            //check if it match teh filter tickets
            if (ticketColor === selectedColor) {
                ticketFound = true;
                eachTicket.style.display = "block"; // show matching
            } else {
                eachTicket.style.display = "none"; // hide
            }
        });
        if (!ticketFound) {
            // deleteMessage.innerHTML =
            ("No tickets found in that selected color band");
            notyf.open({
                type: "warning",
                message: "No tickets found in that selected color band",
            });
        }
    });
    //double click showall
    toolboxColor.addEventListener("dblclick", function () {
        let allTickets = document.querySelectorAll(".ticket-cont");
        toolBoxColors.forEach((c) => c.classList.remove("selected-color"));
        if (allTickets.length == 0) {
            notyf.open({
                type: "warning",
                message: "No tickets found. Please add a new one!",
            });
            return;
        }
        //  loop throught each ticket
        allTickets.forEach((eachTicket) => {
            eachTicket.style.display = "block";
        });
    });
});

//Modal Colors Click for selection
allPriorityColors.forEach((eachColor) => {
    eachColor.addEventListener("click", function () {
        //PICK THE ACTIVE SELECTED AND REMOVE THE ACTIVE CLASS
        const currentActive = document.querySelector(".priority-color.active");
        if (currentActive) currentActive.classList.remove("active");
        // Add active to the clicked one
        eachColor.classList.add("active");
        modalPriorityColor = eachColor.classList[0]; // choose the current modal priority color
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modalCont.style.display = "none";
        addFlag = false;
    }
});

// ONCLICK OF + BUTTON OPEN MODAL OR CLOSE IT IF OPENED
addBtn.addEventListener("click", function () {
    if (removeTaskFlag) {
        notyf.error("Disable delete-mode before adding new tickets");
        return;
    }
    if (addFlag == false) {
        addFlag = true;
        modalCont.style.display = "flex";
        taskArea.focus();
    } else {
        addFlag = false;
        modalCont.style.display = "none";
    }
});

//ONCLICK OF X BUTTON, SET A FLAG AND ON CLICK ON ANY TICKET DELETE THAT.
removeBtn.addEventListener("click", function () {
    modalCont.style.display = "none";
    //console.log(removeBtn);
    removeTaskFlag = !removeTaskFlag;
    let allTickets = document.querySelectorAll(".ticket-cont");

    if (removeTaskFlag) {
        removeBtn.style.color = "red";
        notyf.open({
            type: "warning",
            message: "Delete mode activated — click a ticket to remove it.",
        });
        allTickets.forEach((ticket) =>
            ticket.classList.add("ticket-removal-active")
        );
    } else {
        removeBtn.style.color = "white";
        allTickets.forEach((ticket) =>
            ticket.classList.remove("ticket-removal-active")
        );
    }
});

// TICKET IS CREATED WHEN SHIFT IS PRESSED
modalCont.addEventListener("keydown", function (e) {
    let key = e.key;

    if (key == "Shift") {
        const ticketTask = taskArea.value.trim();
        if (ticketTask == "") {
            notyf.error("Kindly enter the Task for creating the ticket");

            return;
        }
        const ticketID = shortid();
        addNewTicket(modalPriorityColor, ticketID, ticketTask);

        modalCont.style.display = "none";
        addFlag = false;
        taskArea.value = "";
    }
});

// calling on pressing shift key by saving the data in localstorage and call createticket to show in UI
function addNewTicket(ticketColor, ticketID, ticketTask) {
    if (ticketID !== undefined) {
        ticketsArr.push({ ticketTask, ticketColor, ticketID });
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    }
    createTicket(modalPriorityColor, ticketID, ticketTask);
}

// ADDING TICKET TO DOM
function createTicket(ticketColor, ticketID, ticketTask) {
    const ticketCont = document.createElement("div");
    ticketCont.classList.add("ticket-cont");
    ticketCont.style.setProperty("--ticket-color", ticketColor);

    ticketCont.innerHTML = `
        <div class="ticket-body">
            <div class="ticket-id">ID : ${ticketID}</div>
            <div class="ticket-task">${ticketTask}</div>
            <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>
        </div>
    `;

    // append the created ticket to the main container
    mainCont.appendChild(ticketCont);

    // attach event handlers
    handleRemoval(ticketCont);
    handleLock(ticketCont);
    handleColor(ticketCont);
}

// function to remove tickets when delete mode is active
function handleRemoval(ticket) {
    // newly created ticket -> add event listener to remove here
    ticket.addEventListener("click", function () {
        if (!removeTaskFlag) return;
        ticket.remove();
        const ticketUniqueID = ticket
            .querySelector(".ticket-id")
            .innerText.split(":")[1]
            .trim();
        let ticketIdx = ticketsArr.findIndex(function (ticket) {
            return ticket.ticketID === ticketUniqueID;
        });
        //console.log(ticketIdx);
        ticketsArr.splice(ticketIdx, 1);
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    });
}

//function to handle lock /unlock
function handleLock(ticket) {
    /*  select the ticketlock div
     * fetch the icon element
     * on click if the icon is close,
     * then toggle with enabling the ticketTaskArea div as editable
     *  */
    const ticketLockElem = ticket.querySelector(".ticket-lock");
    const ticketLockIcon = ticketLockElem.children[0]; // icon element
    const ticketTaskArea = ticket.querySelector(".ticket-task");
    const ticketUniqueID = ticket
        .querySelector(".ticket-id")
        .innerText.split(":")[1]
        .trim();
    //console.log(ticket);
    ticketLockIcon.addEventListener("click", function () {
        console.log(ticketUniqueID);
        if (ticketLockIcon.classList.contains(lockClose)) {
            ticketLockIcon.classList.remove(lockClose);
            ticketLockIcon.classList.add(lockOpen);
            // make the task area editable
            ticketTaskArea.setAttribute("contenteditable", true);
            ticketTaskArea.focus();
            ticketTaskArea.style.backgroundColor = "#e9e6e6ff";
        } else {
            ticketLockIcon.classList.remove(lockOpen);
            ticketLockIcon.classList.add(lockClose);
            // make the taske area as non editable
            ticketTaskArea.setAttribute("contenteditable", false);
            ticketTaskArea.style.backgroundColor = "inherit";
            // update localstorage if needed
            let ticketIndex = ticketsArr.findIndex(
                (t) => t.ticketID === ticketUniqueID
            );
            if (ticketIndex !== -1) {
                ticketsArr[ticketIndex].ticketTask = ticketTaskArea.innerText;
                localStorage.setItem("tickets", JSON.stringify(ticketsArr));
            }
        }
    });
}

function handleColor(ticket) {
    ticket.addEventListener("click", function (e) {
        //stop if lock is unlocked
        if (ticket.querySelector(".ticket-task").isContentEditable) return;

        // step 1: get current color from CSS variable
        let currentColor = ticket.style
            .getPropertyValue("--ticket-color")
            .trim();
        // Only change color if user clicks on the left border area (optional)
        if (
            e.target.closest(".ticket-lock") ||
            e.target.closest(".ticket-task")
        )
            return;

        // step 2: find current color index
        let currIdx = colors.findIndex((color) => color === currentColor);

        // step 3: calculate next color index
        let newColorIdx = (currIdx + 1) % colors.length;

        // step 4: update the border color
        ticket.style.setProperty("--ticket-color", colors[newColorIdx]);

        // update localstorage if needed
        const ticketID = ticket
            .querySelector(".ticket-id")
            .innerText.split(":")[1]
            .trim();
        let ticketIndex = ticketsArr.findIndex((t) => t.ticketID === ticketID);
        if (ticketIndex !== -1) {
            ticketsArr[ticketIndex].ticketColor = colors[newColorIdx];
            localStorage.setItem("tickets", JSON.stringify(ticketsArr));
        }
    });
}
