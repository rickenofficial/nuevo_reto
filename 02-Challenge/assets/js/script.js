// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    if (!nextId) {
        nextId = 1; // If nextId doesn't exist, initialize it to 1
    }
    let taskId = nextId; // Get the current value of nextId
    nextId++; // Increment nextId for the next task
    localStorage.setItem("nextId", JSON.stringify(nextId)); // Store the new value of nextId in localStorage
    return taskId; // Return the unique task ID

}

// Todo: create a function to create a task card
function createTaskCard(task) {
    
    let taskCard = document.createElement('div');
    
    taskCard.setAttribute('data-id', task.id);
    taskCard.className = 'card mb-2';
    let today = new Date();
    let dueDate = new Date(task.dueDate);
    let overdueDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

    let colorClass = '';
    if (overdueDays > 0) {
        colorClass = 'bg-danger text-white'; // Tarea vencida (rojo)
    } else if (overdueDays >= -2) {
        colorClass = 'bg-warning text-dark'; // Tarea cerca de vencer (amarillo)
    } else {
        colorClass = 'bg-light'; // Tarea dentro del tiempo límite (gris claro)
    }

    taskCard.innerHTML = `
        <div class="card-body ${colorClass}">
            <h5 class="card-title">${task.name}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        </div>
    `;
    // add delete button
    let deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger delete-task';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function(event) {
        handleDeleteTask(event, task.id);
    });
    taskCard.querySelector('.card-body').appendChild(deleteButton);

    taskCard.setAttribute('data-status', task.status); // Asegúrate de establecer el data-status correctamente
    
    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    
    document.getElementById('todo-cards').innerHTML = ''; // Clear the container before rendering
    taskList.forEach(task => {
        let taskCard = createTaskCard(task);
        document.getElementById('todo-cards').appendChild(taskCard);
        taskCard.setAttribute('data-status', task.status); // Set the data-status attribute
        


    });

    // Make the cards draggablesi
    $(".card").draggable({
        handle: ".card-body", // Especifica el elemento dentro de la tarjeta que actuará como el "manejador" para arrastrar
        revert: "invalid",
        stack: ".card",
        cursor: "move",
        helper: "clone"
    });

     // Make the columns droppable
     $(".column").droppable({
        drop: handleDrop
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    let taskName = document.getElementById('taskName').value;
    let taskDescription = document.getElementById('taskDescription').value;
    let taskDueDate = document.getElementById('taskDueDate').value;

    let newTask = {
        id: generateTaskId(),
        name: taskName,
        description: taskDescription,
        dueDate: taskDueDate,
        status: "to-do"
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();

    // Reset the form
    document.getElementById('taskForm').reset();

    // Close the modal
    $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){

    console.log("Handle Delete Task function is called");
    console.log("Event target:", event.target);
     // Verificar si el elemento clickeado tiene la clase 'delete-task'
        if (event.target.classList.contains('delete-task')) {
        // Obtener la tarjeta de la tarea correspondiente
        let taskCard = event.target.closest('.card');
        // Obtener el ID de la tarea a eliminar
        let taskId = parseInt(taskCard.getAttribute('data-id'));

        // Filtrar la lista de tareas para eliminar la tarea con el ID proporcionado
        taskList = taskList.filter(task => task.id !== taskId);

        // Actualizar el almacenamiento local con la nueva lista de tareas
        localStorage.setItem("tasks", JSON.stringify(taskList));

        $(document).ready(function() {
            // Asociar evento de clic a los botones de eliminar
            $('.delete-task').click(handleDeleteTask);
        });

        // Renderizar la lista de tareas actualizada
        renderTaskList();
    }
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    
    // Obtener el ID de la tarea y la nueva columna
    let taskId = parseInt(ui.draggable.attr('data-id'));
    let newStatus = event.target.getAttribute('data-status');
    
    // Actualizar el estado de la tarea en la lista de tareas
    let taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList[taskIndex].status = newStatus;

        // Quitar la tarea del contenedor original
        ui.draggable.remove();

        // Agregar la tarea al nuevo contenedor
        $(event.target).find('.card-body').append(ui.draggable);

        // Actualizar el almacenamiento local con la nueva lista de tareas
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }
}

// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // Renderizar la lista de tareas al cargar la página
    renderTaskList();

    // Asociar la función handleDrop con las columnas donde se pueden soltar las tarjetas
    $(".lane").droppable({
        accept: ".card",
        drop: handleDrop
    });
});

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    taskList = taskList || []; // Initialize taskList if it's null
    nextId = nextId || 1; // Initialize nextId if it's null

    renderTaskList();

    // Add event listeners
    document.getElementById('taskForm').addEventListener('submit', handleAddTask);
    document.getElementById('todo-cards').addEventListener('click', handleDeleteTask);

    // Make lanes droppable
    $(".lane").droppable({
        accept: ".card",
        drop: handleDrop
    });

    // Initialize date picker
    $("#taskDueDate").datepicker();
});
