let container = $(".booksContainer");
let pageSize = 10;
let pageNumber = 1;
let tempArray = [];
let sortAscending = false;

let addNewBookToDisplay = (book) => {
    container.append(`
                <div class="bookItem row">
                    <div class="bookItem__cel bookItem__id">${book.id}</div>
                    <div class="bookItem__cel bookItem__title col-1">${book.title}</div>
                    <div class="bookItem__cel bookItem__author col-1">${book.author}</div>
                    <div class="bookItem__cel bookItem__publishingInfo col-1">${book.yearOfPublication} (${book.publisher})</div>
                    <div class="bookItem__cel bookItem__length col-1">${book.length}</div>
                    <div class="bookItem__cel bookItem__AdittionalInfo col-1" title="${getAdditionalInformations(book)}">Additional info</div>
                    <div class="bookItem__cel bookItem__isbn col-1">${book.ISBN}</div>
                    <div class="bookItem__cel bookItem__review col-4">${normalizeReview(book.review)}</div>
                    <div class="bookItem__cel bookItem__delete${book.id} col-1"><button class="btn btn-danger">Delete</button></div>
        </div>`)
    handleDeleteButton(book.id);
}

let displayPage = (pageNumber, pageSize, books, container) => {
    container.html("");
    let startIndex = (pageNumber - 1) * pageSize;
    let endIndex = pageNumber * pageSize;
    let displayBooks = books.slice(startIndex, endIndex);
    displayBooks.forEach((b) => addNewBookToDisplay(b));
}

let setPagination = (length) => {
    let pages = $("#pages");
    pages.html("");
    let elements = "";
    for (let i = 0; i < length; ++i) {
        elements += `<li class="page-item"><a class="page-link" href="#">${i+1}</a></li>`
    }
    pages.append(elements);
    pages.find("li").on('click', function() {
        pageNumber = $(pages).find("li").index($(this)) + 1;
        setPage(pageNumber);
        displayPage(pageNumber, pageSize, tempArray.length == 0 ? getBooksFromDB() : tempArray, container);
    })
}

let getMaxPageNumber = (length) => {
    return (length % pageSize | 0) == 0 ? (length / pageSize | 0) : (length / pageSize | 0) + 1;
}

let setPage = (pageNumber) => {
    pageNumber < 2 ? $("#previous").addClass("disabled") : $("#previous").removeClass("disabled");
    pageNumber > getMaxPageNumber(getBooksFromDB().length) - 1 ? $("#next").addClass("disabled") : $("#next").removeClass("disabled");
    let pages = $("#pages");
    pages.find(".active").removeClass("active");
    pages.find("li").eq(pageNumber - 1).addClass("active");
}

let normalizeReview = function(review) {
    let text = review;
    if (text.length > 50) {
        i = 47;
        //while (text[i] != " ") { i -= 1 };
        text = text.slice(0, i);
        text += "...";
    }
    return text;
}

let getAdditionalInformations = function(book) {
    if (book.kind == "novel") {
        return getNovelAddInfo(book);
    } else if (book.kind == "anthology") {
        return getAnthologyAddInfo(book);
    }
}

let getNovelAddInfo = (book) => {
    let message = '';
    if (book.series) {
        message += `${book.series} (#${book.seriesNumber})`;
    }
    return message;
}

let getAnthologyAddInfo = function(book) {
    let message = '';
    // check if all stories are from one author
    let i = 0;
    for (; i < book.stories.length - 1;) {
        if (book.stories[i].author == book.stories[i + 1].author) break;
        i += 1;
    }
    if (i - 2 == book.stories.length) {
        message = `${book.stories.length} stories by ${book.stories[0].author}`;
        return message;
    }
    // get "X stories by Y authors" and original stories
    let authors = 1,
        orgStories = 0;
    let _stories = book.stories;
    _stories.sort((a, b) => asc(a["author"], b["author"]));
    for (i = 1; i < _stories.length; ++i) { if (_stories[i].author != _stories[i - 1].author) authors += 1; }
    for (i = 0; i < _stories.length; ++i) { if (_stories[i].original === true) orgStories += 1; }
    message = `${_stories.length} ${_stories.length % 10 == 1 && _stories.length != 11 ? 
                    "story" : "stories"} by ${authors} ${_stories.length == 1 ? "author" : "authors"}`;
    message += `\n${orgStories} original ${orgStories == 1? "story" : "stories"}`
    return message;
}

let handleDeleteButton = (id) => {
    $(`.bookItem__delete${id}`).on('click', () => {
        let books = getBooksFromDB();
        for (let i = 0; i < books.length; ++i) {
            if (books[i].id == id) {
                books.splice(i, 1);
                break;
            }
        }
        localStorage.books = JSON.stringify(books);
        refreshDisplay(books);
    })
}

let refreshDisplay = (books) => {
    setPagination(getMaxPageNumber(books.length));
    setPage(pageNumber);
    displayPage(pageNumber, pageSize, books, container);
}

let updateDatabase = (book) => {
    let books = getBooksFromDB();
    books.push(book);
    localStorage.books = JSON.stringify(books);
}

let getBooksFromDB = () => {
    return localStorage.books != null ? JSON.parse(localStorage.books) : [];
}

let getStories = () => {
    return sessionStorage.stories != null ? JSON.parse(sessionStorage.stories) : [];
}

let addStoryToTempDB = (story) => {
    let stories = getStories();
    stories.push(story);
    sessionStorage.stories = JSON.stringify(stories);
}

let validNovelInput = () => {
    let message = '';
    if (!$("#novelTitle").val()) message += 'Invalid title\n';
    if (!$("#novelAuthor").val()) message += 'Invalid author\n';
    if (!Number.isInteger(Number($("#novelIsbn").val()))) message += 'Invalid ISBN\n';
    if (message)
        alert(message);
    return !message;
}

let validAnthologyInput = () => {
    let message = '';
    if (!$("#anthologyTitle").val()) message += 'Invalid title\n';
    if (!$("#anthologyEditor").val()) message += 'Invalid editor\n';
    let stories = getStories();
    if (stories.length < 2) message += "Warning: you need at least 2 stories";
    if (message)
        alert(message);

    return (message.length == 0);
}

let resetInputs = function() {
    tempArray = [];
    for (let i = 0; i < arguments.length; ++i) arguments[i].val("");
}

let filterBooks = function(fn, books) {
    tempArray = books.filter((book) => fn(book));
    pageNumber = 1;
    refreshDisplay(tempArray);
}

let handleSorts = function(books, property) {
    sortAscending = !sortAscending;
    tempArray = sortBooks(books, property);
    refreshDisplay(tempArray);
}

let sortBooks = (books, property) => {
    return [].concat(books.sort((a, b) => sortOrder()(a[property], b[property])));
}

let sortOrder = () => {
    return sortAscending ? asc : desc;
}

function asc(a, b) {
    return a < b ? 1 : (a > b ? -1 : 0);
}

function desc(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0)
}

$(() => {

    $('[data-toggle="tooltip"]').tooltip();

    refreshDisplay(getBooksFromDB());

    $("#previous").on('click', function() {
        if (pageNumber > 1)
            setPage(--pageNumber);
        refreshDisplay(tempArray.length == 0 ? getBooksFromDB() : tempArray);
    })

    $("#next").on('click', function() {
        if (pageNumber < getMaxPageNumber(getBooksFromDB().length))
            setPage(++pageNumber);
        refreshDisplay(tempArray.length == 0 ? getBooksFromDB() : tempArray);
    })

    $("#saveBook").on('click', () => {
        if ($("#typeOfBook").val() == "novel") {
            if (validNovelInput()) {
                let id = getBooksFromDB().length + 1;
                let title = $("#novelTitle").val();
                let author = $("#novelAuthor").val();
                let publisher = $("#novelPublisher").val();
                let publication = Number($("#novelPublication").val());
                let pages = Number($("#novelPages").val());
                let series = $("#novelSeriesName").val();
                let seriesNumber = Number($("#novelSeriesNumber").val());
                let ISBN = Number($("#novelIsbn").val());
                let review = $("#novelReview").val();
                let book = new Novel(id, title, author, publisher, publication, pages, series, seriesNumber, ISBN, review);
                updateDatabase(book);
                addNewBookToDisplay(book);
            }
        } else {
            if (validAnthologyInput()) {
                let id = getBooksFromDB().length + 1;
                let title = $("#anthologyTitle").val();
                let author = $("#anthologyEditor").val();
                let publisher = $("#anthologyPublisher").val();
                let publication = Number($("#anthologyPublication").val());
                let pages = Number($("#anthologyPages").val());
                let stories = getStories();
                let ISBN = Number($("#anthologyIsbn").val());
                let review = $("#anthologyReview").val();
                let book = new Anthology(id, title, author, publisher, publication, pages, stories, ISBN, review);
                delete sessionStorage.stories;
                updateDatabase(book);
                addNewBookToDisplay(book);
            }
        }
        refreshDisplay(getBooksFromDB());

    });

    $("#novelSeriesName").on('change', () => {
        if (!!$("#novelSeriesName").val()) {
            $("#novelSeriesNumber").prop('disabled', false);
        } else {
            $("#novelSeriesNumber").prop('disabled', true);
        }
    })

    $("#typeOfBook").on('change', () => {
        let type = $("#typeOfBook").val();
        if (type == "none") {
            $("#novelEntry").addClass("hidden");
            $("#anthologyEntry").addClass("hidden");
            $("#info").removeClass("hidden");
        } else if (type == "anthology") {
            $("#novelEntry").addClass("hidden");
            $("#anthologyEntry").removeClass("hidden");
            $("#info").addClass("hidden");
        } else if (type == "novel") {
            $("#novelEntry").removeClass("hidden");
            $("#anthologyEntry").addClass("hidden");
            $("#info").addClass("hidden");
        }
    });

    $("#addStory").on('click', () => {
        let title = $("#storyTitle").val();
        let author = $("#storyAuthor").val();
        let original = $("#isOriginal").val() == "yes" ? true : false;
        let story = new Story(title, author, original);
        addStoryToTempDB(story);
        $("#anthologyStories").text($("#anthologyStories").text() + story.title + ",");
        $("#storyTitle").val("");
        $("#storyAuthor").val("");
        $("#isOriginal").val("none");
    })

    $("#searchByTitleOrAuthor").keyup(() => {
        resetInputs($("#filterPeriod"), $("#searchNovelsByUser"));
        if (!!$("#searchByTitleOrAuthor").val()) {
            filterBooks((book) => {
                let phrase = $("#searchByTitleOrAuthor").val().toLowerCase();
                if (book.title.toLowerCase().indexOf(phrase) != -1) return true;
                if (book.author.toLowerCase().indexOf(phrase) != -1) return true;
                if (book.kind == "anthology") {
                    for (let i = 0; i < book.stories.length; ++i)
                        if (book.stories[i].author.toLowerCase().indexOf(phrase) != -1) return true;
                }
            }, getBooksFromDB());
        } else {
            tempArray = [];
            refreshDisplay(getBooksFromDB());
        }
    });

    $("#filterPeriod").keyup(() => {
        resetInputs($("#searchByTitleOrAuthor"), $("#searchNovelsByUser"));
        if (!!$("#filterPeriod").val()) {
            filterBooks((book) => {
                let year = $("#filterPeriod").val();
                if (Number(book.yearOfPublication) >= year) return true;
            }, getBooksFromDB());
        } else {
            tempArray = [];
            refreshDisplay(getBooksFromDB());
        }
    });

    $("#searchNovelsByUser").keyup(() => {
        resetInputs($("#filterPeriod"), $("#searchByTitleOrAuthor"));
        if (!!$("#searchNovelsByUser").val()) {
            filterBooks((book) => {
                let phrase = $("#searchNovelsByUser").val().toLowerCase();
                if (book.kind == "novel")
                    if (book.series.toLowerCase().indexOf(phrase) != -1) return true;
            }, getBooksFromDB());
        } else {
            tempArray = [];
            refreshDisplay(getBooksFromDB());
        }
    });

    $("#showNovels").on('click', () => {
        resetInputs($("#filterPeriod"), $("#searchByTitleOrAuthor"), $("#searchNovelsByUser"));
        filterBooks((book) => {
            if (book.kind == "novel") return true;
        }, getBooksFromDB());
    });

    $("#showNovelsPartOfSeries").on('click', () => {
        resetInputs($("#filterPeriod"), $("#searchByTitleOrAuthor"), $("#searchNovelsByUser"));
        filterBooks((book) => {
            if (book.kind == "novel" && !!book.series) return true;
        }, getBooksFromDB());
    });

    $("#showAnthologies").on('click', () => {
        resetInputs($("#filterPeriod"), $("#searchByTitleOrAuthor"), $("#searchNovelsByUser"));
        filterBooks((book) => {
            if (book.kind == "anthology") return true;
        }, getBooksFromDB());
    });

    $("#showAnthologiesWithOriginalStories").on('click', () => {
        resetInputs($("#filterPeriod"), $("#searchByTitleOrAuthor"), $("#searchNovelsByUser"));
        filterBooks((book) => {
            if (book.kind == "anthology") {
                for (let i = 0; i < book.stories.length; ++i) {
                    if (book.stories[i].original == true) return true;
                }
            }
        }, getBooksFromDB());
    });

    $(".headerProperty").on('click', function() {
        handleSorts(tempArray == 0 ? getBooksFromDB() : tempArray, $(this).attr('id'));
    })

    $(window).scroll(function(event) {
        let st = $(this).scrollTop();
        if (st > 10) {
            $("#addNewBook").fadeOut();
        } else {
            $("#addNewBook").fadeIn();
        }
    });
})