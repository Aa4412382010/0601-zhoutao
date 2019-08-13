$(
    $('input[type="submit"]').on('click', function () {
        addTodo()
    }),
    $('input[value="重置"]').on('click', function () {
        deleteReset()
    }),
    $('.find-in').on('click', function () {
        findIn();
    })
)

function addTodo() {
    let todo = $('#new-item').val();
    let important = $('input[type="radio"]:checked').val();
    var in_date = $('.time').children().val();
    if (in_date == false) {
        let date = new Date();
        in_date = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0') + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0')
    }

    addItem(todo, status = 'todo', important, in_date);
    init_todos();
}

function checkItem(item) {
    let li = $(item).next();
    if ($(item).prop('checked')) {
        li.css('text-decoration', 'line-through');
        changeStatus($(item).parent().attr('id'), 'done');
    } else {
        li.css('text-decoration', '');
        changeStatus($(item).parent().attr('id'), 'todo');
    }
    updateTodoList();
    updateDoneList();
}

function updateTodoList() {
    let box = $('#todo-list');
    box.empty();
    if (getTodoList()) {
        let done_list = getTodoList().filter(x => x.status == 'todo');
        for (let todo of done_list) {
            let li = $('<li></li>');
            li.append(todo.time + '--' + todo.text)
            box.append(li);
        }
    }
}

function updateDoneList() {
    let box = $('#done-list');
    box.empty();
    if (getTodoList()) {
        let done_list = getTodoList().filter(x => x.status == 'done');
        for (let todo of done_list) {
            let li = $('<li></li>');
            li.append(todo.time + '--' + todo.text)
            box.append(li);
        }
    }
}

function changeStatus(id, status) {
    let todo_list = getTodoList();
    for (let todo of todo_list) {
        if (todo.id == id) {
            todo.status = status;
        }
    }
    localStorage.setItem('what-todo', JSON.stringify(todo_list));
}

function inserTodo(todo, new_class, box_type = 'important') {
    let box = $('#' + box_type);
    if (box.children().attr('class') !== 'todo-title') {
        box.children().removeClass('hidden')
    }
    let in_date = todo.time;
    if ($('#' + todo.id).length == 0) {
        let li = $('<li></li>');
        li.attr('class', new_class)
        li.attr('id', todo.id);
        li.append('<input type="checkbox" name="item">' + '<p>' + in_date + '---' + todo.text + '</p>' + '<input type="reset" value="删除">');
        box.append(li);
        $('input[type="checkbox"]').on('click', function () {
            checkItem(this)
        })
        $('input[value="删除"]').on('click', function () {
            deleteItem(this)
        })
        updateDoneStyle(todo, li);
    }

}


function getTodoList() {
    return JSON.parse(localStorage.getItem('what-todo'));
}

function addItem(memo, status = 'todo', important = 1, date) {
    let todo_list = [];
    let old_list = localStorage.getItem('what-todo');
    if (old_list) {
        todo_list = JSON.parse(old_list);
    }
    let todo = {}
    todo.id = 1;
    if (old_list) {
        todo.id += parseInt(todo_list[todo_list.length - 1].id);
    }
    todo.text = memo;
    todo.status = status; // todo, done
    todo.important = important; // 1 important, 2 not
    todo.time = date
    todo_list.push(todo);

    localStorage.setItem('what-todo', JSON.stringify(todo_list))
}

function todayTodo(todos) {
    new_class = 'today'
    if (todos.important == 1) {
        inserTodo(todos, new_class);
    } else if (todos.important == 2) {
        inserTodo(todos, new_class, box_type = 'ordinary')
    } else if (todos.important == 3) {
        inserTodo(todos, new_class, box_type = 'soso');
    } else {
        inserTodo(todos, new_class, box_type = 'easy');
    }
    let info = $('.todo-info:first');
    info.addClass('hidden');
}

function notToday(todos) {
    new_class = 'follow-up'
    if (todos.important == 1) {
        inserTodo(todos, new_class, box_type = 'todo-important');
    } else if (todos.important == 2) {
        inserTodo(todos, new_class, box_type = 'todo-ordinary');
    } else if (todos.important == 3) {
        inserTodo(todos, new_class, box_type = 'todo-soso');
    } else {
        inserTodo(todos, new_class, box_type = 'todo-easy');
    }
    let info = $('.todo-info:last');
    info.addClass('hidden');
}

function init_todos() {
    let todo_list = getTodoList();
    let today = new Date();
    if (todo_list.length) {
        for (let todos of todo_list) {
            let todos_year = todos.time.split('-')[0];
            let todos_mouth = todos.time.split('-')[1];
            let todos_date = todos.time.split('-')[2];
            if (parseInt(todos_year) == today.getFullYear()) {
                if (parseInt(todos_mouth) == (today.getMonth() + 1) && parseInt(todos_date.substr(0, 2)) <= today.getDate()) {
                    todayTodo(todos);
                } else if (parseInt(todos_mouth) < (today.getMonth() + 1)) {
                    todayTodo(todos)
                } else if (parseInt(todos_mouth) == (today.getMonth() + 1) && parseInt(todos_date.substr(0, 2)) > today.getDate()) {
                    notToday(todos);
                } else if (parseInt(todos_mouth) > (today.getMonth() + 1)) {
                    notToday(todos);
                }
            }
        }
        updateDoneList();
        updateTodoList()
    }
}

function deleteReset() {
    localStorage.clear();
    location.reload();
}

function deleteItem(item) {
    let item_parent = $(item).parent()
    if (item_parent.attr('class') == 'today') {
        var info = $('.todo-info:first');
    } else {
        var info = $('.todo-info:last')
    }
    let todo_list = getTodoList();
    let id = parseInt(item_parent.attr('id'))
    for (let i = todo_list.length; i > 0; i--) {
        if (todo_list[i - 1].id == id) {
            todo_list.splice(i - 1, 1)
        }
    }
    if (todo_list.length == false) {
        localStorage.clear();
        item_parent.parent().children().addClass('hidden')
        info.removeClass('hidden');
    } else {
        localStorage.setItem('what-todo', JSON.stringify(todo_list));
    }
    $(item).parent().remove();
    updateDoneList();
    updateTodoList()
}

function updateDoneStyle(todo, li) {
    if (todo.status == 'done') {
        li.css('text-decoration', 'line-through');
        li.children('input:first-child').prop('checked', true)
    } else {
        li.css('text-decoration', '');
        li.children('input:first-child').prop('checked', false);
    }
}

function findIn() {
    let value = $('.find').children('input').val();
    todo_list = getTodoList();
    let find_list = $('.main:first');
    find_list.empty();
    find_list.append('<h2>搜索结果</h2>')
    if (todo_list) {
        for (let todo of todo_list) {
            if (todo.text.indexOf(value) > -1) {
                let li = $('<li></li>');
                li.append(todo.time + '--' + todo.text)
                find_list.append(li);
            }
        }
    }
    let input = $('<button name="return"></button>');
    input.append('返回')
    find_list.append(input);
    $('button[name="return"]').on('click', function () {
        location.reload();
    })

}
// 刷新页面初始化
init_todos();