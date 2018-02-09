var results;
var comics = [];
var characters = [];

$(document).ready(function () {

    selectToggleOption();
    $('#toggleButton').on("change", function () {
        selectToggleOption();
    });

    if ($("#infoMarvel").length != 0) {
        setInformation();
    }

    if ($(".grafico").length != 0) {

        for (var i = 0; i < localStorage.length; i++) {
            comics.push(JSON.parse(localStorage.getItem("comic_" + i)));
            if (comics != null) {
                comics = comics.filter(checkEmty);
            }
            characters.push(JSON.parse(localStorage.getItem("personaje_" + i)));
            if (characters != null) {
                characters = characters.filter(checkEmty);
            }
        }

        function checkEmty(items) {
            return items != null;
        }

        loadCharts("grafico1");

        $("#b1").click(function () {
            $(this).addClass("seleccionado");
            $("#b2, #b3").removeClass("seleccionado");
            loadCharts("grafico1");
        })
        $("#b2").click(function () {
            $(this).addClass("seleccionado");
            $("#b1, #b3").removeClass("seleccionado");
            loadCharts("grafico2");
        })
        $("#b3").click(function () {
            $(this).addClass("seleccionado");
            $("#b1, #b2").removeClass("seleccionado");
            loadCharts("grafico3");
        })
    }
});

// Función para cargar o los comics o los personajes
function selectToggleOption() {
    $(".contenedor-elementos").hide();
    $(".error").hide();

    comicsAPI = "https://gateway.marvel.com:443/v1/public/comics?hasDigitalIssue=true&limit=100&apikey=d90ccadc2f5c027e65d23a6aaf9b57d3";
    charactersAPI = "https://gateway.marvel.com:443/v1/public/characters?limit=100&apikey=d90ccadc2f5c027e65d23a6aaf9b57d3";

    if ($("#toggleButton").prop("checked")) {
        loadData(comicsAPI, "comics");
    } else {
        loadData(charactersAPI, "characters");
    }
}

// Función para cargar los datos de la API
function loadData(urlAPI, option) {
    $('.spinner').show();
    $.ajax({
        url: urlAPI,
        type: 'get',
        dataType: 'json',
        success: function (response) {
            $('.spinner').hide();
            results = response.data.results;
            if (option == "comics") {
                createComics();
            } else {
                createCharacters();
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        $(".error").show();
        $('.spinner').hide();
    });
}

// Función para crear los comics en el html
function createComics() {
    $("#personajes").hide();
    $("#comics").show();
    var container;
    var items = $("#comics");
    for (var i in results) {
        image = results[i].thumbnail.path + '/portrait_incredible.' + results[i].thumbnail.extension;
        title = results[i].title;

        container = "<div id='comic_" + i + "' class='comic'>";
        container += "<img src='" + image + "' title='" + title + "' alt='" + title + "'/>";
        container += "<span class='titulo'>" + title + "</span>";
        container += "</div>";

        items.append(container);
    }
    selectItem();
    // pagination(items, results.length);
}

// Función para crear los personajes en el html
function createCharacters() {
    $("#personajes").show();
    $("#comics").hide();
    var container;
    var items = $("#personajes");
    for (var i in results) {
        image = results[i].thumbnail.path + '/portrait_incredible.' + results[i].thumbnail.extension;
        name = results[i].name;

        container = "<div id='personaje_" + i + "' class='personaje'>";
        container += "<img src='" + image + "' title='" + name + "' alt='" + name + "'/>";
        container += "<span class='titulo'>" + name + "</span>";
        container += "</div>";

        items.append(container);
    }
    selectItem();
    // pagination(items, results.length);
}

// Función para hacer la paginación
function pagination(items, size) {
    $(items).pagination({
        items: size,
        itemsOnPage: 5,
        cssStyle: 'light-theme'
    });
}

// Función para interactuar con los resultados
function selectItem() {
    var elemento;

    $(".comic").on("click", function (event) {
        elemento = event.currentTarget;
        localStorage.setItem("itemID", elemento.id);
        getInformation();
    });

    $(".personaje").on("click", function (event) {
        elemento = event.currentTarget;
        localStorage.setItem("itemID", elemento.id);
        getInformation();
    });
}

// Función para obtener la informacion del LocalStorage
function getInformation() {
    var itemSelected = [];
    var itemID = localStorage.getItem("itemID");
    var shortID = itemID.slice(itemID.indexOf("_") + 1);

    for (var i in results) {
        if (i == shortID) {
            itemSelected.push(results[i]);
        }
        id = itemID.replace(/[0-9]+/g, "");
        if (localStorage.getItem(id + i) == null) {
            for (var i in results) {
                if (id == "comic_") {
                    var title = [results[i].title, 0];
                    localStorage.setItem(id + i, JSON.stringify(title));
                } else {
                    var title = [results[i].name, 0];
                    localStorage.setItem(id + i, JSON.stringify(title));
                }
            }
        }
    }
    localStorage.setItem("itemSelected", JSON.stringify(itemSelected));
    location.href = "../../assets/portfolio/information.html";
}

// Función para insertar la información en la página
function setInformation() {

    itemSelected = localStorage.getItem("itemSelected");
    item = JSON.parse(itemSelected);

    image = item[0].thumbnail.path + "/portrait_incredible." + item[0].thumbnail.extension;
    title = item[0].title;
    name = item[0].name;
    description = item[0].description;

    $("#caratula").attr({ "src": image, "alt": "Caratula" });

    if (title != null) {
        $("#tituloInfo .enfasis").text(title);
        if (item[0].prices[0].price != null) {
            $("#generoPeli .enfasis").text(item[0].prices[0].price + " $");
        }
    } else {
        $("#generoPeli").hide();
        $("#tituloInfo .enfasis").text(name);
    }

    if (description != "" && description != null) {
        $("p.enfasis").text(description);
    } else {
        $("p.enfasis").text("Información no disponible en la base de datos.");
    }

    $("#b_anonimo").on("click", function () {
        updateVote();
        location.href = "results.html";
    });

    $("form").on("submit", function () {
        updateVote();
        insertUser();
    });
}

// Función que actualiza las votaciones
function updateVote() {
    var itemVoted = JSON.parse(localStorage.getItem(localStorage.getItem("itemID")));
    localStorage.setItem(localStorage.getItem("itemID"), JSON.stringify([itemVoted[0], itemVoted[1] + 1]));
}

// Función que inserta el usuario en localStorage
function insertUser() {
    var itemVoted = JSON.parse(localStorage.getItem(localStorage.getItem("itemID")));

    var contador = localStorage.getItem("votation");
    if (contador == null) {
        contador = 1;
    } else {
        contador++;
    }

    localStorage.setItem("votation", contador);

    var user = [];
    user.push(itemVoted[0]);
    user.push($("#name").val());
    user.push($("#surname").val());
    user.push($("#date").val());
    user.push($("#opinion").val());

    localStorage.setItem("vote_" + contador, JSON.stringify(user));
}

// Función para cargar el grafico con la opción elegida
function loadCharts(option) {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(function () {
        switch (true) {
            case option == "grafico1":
                drawComicsCharts(option);
                drawCharactersCharts(option);
                break;
            case option == "grafico2":
                drawComicsCharts(option);
                drawCharactersCharts(option);
                break;
            case option == "grafico3":
                drawComicsCharts(option);
                drawCharactersCharts(option);
                break;
        }
    });

    function drawComicsCharts(type) {

        var data = new google.visualization.DataTable();
        data.addColumn("string", "titulo");
        data.addColumn("number", "votos");

        if(comics == null) {
            alert("error");
        } else {
            for (var i = 0; i < comics.length; i++) {
                data.addRow([comics[i][0], comics[i][1]]);
            }
        }

        var chartOptions1;
        var chart1;

        switch (true) {
            case option == "grafico1":
                chartOptions1 = {
                    title: "COMICS DE MARVEL",
                    width: $("#grafico1").width(),
                    is3D: true
                };
                chart1 = new google.visualization.PieChart(document.getElementById("grafico1"));
                break;
            case option == "grafico2":
                chartOptions1 = {
                    title: "COMICS DE MARVEL",
                    width: $("#grafico1").width(),
                    chartArea: { width: "50%" },
                    hAxis: { title: "Votos", minValue: 0 },
                    vAxis: { title: "Comics" }
                };
                chart1 = new google.visualization.BarChart(document.getElementById("grafico1"));
                break;
            case option == "grafico3":
                chartOptions1 = {
                    title: "COMICS DE MARVEL",
                    width: $("#grafico1").width(),
                    pieHole: 0.2
                };
                chart1 = new google.visualization.PieChart(document.getElementById("grafico1"));
                break;
        }
        chart1.draw(data, chartOptions1);
    }

    function drawCharactersCharts(type) {

        var data = new google.visualization.DataTable();
        data.addColumn("string", "titulo");
        data.addColumn("number", "votos");

        for (var i = 0; i < characters.length; i++) {
            data.addRow([characters[i][0], characters[i][1]]);
        }

        var chartOptions2;
        var chart;

        switch (true) {
            case option == "grafico1":
                chartOptions2 = {
                    title: "PERSONAJES DE MARVEL",
                    width: $("#grafico2").width(),
                    is3D: true
                };
                chart = new google.visualization.PieChart(document.getElementById("grafico2"));
                break;
            case option == "grafico2":
                chartOptions2 = {
                    title: "PERSONAJES DE MARVEL",
                    width: $("#grafico2").width(),
                    chartArea: { width: "50%" },
                    hAxis: { title: "Votos", minValue: 0 },
                    vAxis: { title: "Personajes" }
                };
                chart = new google.visualization.BarChart(document.getElementById("grafico2"));
                break;
            case option == "grafico3":
                chartOptions2 = {
                    title: "PERSONAJES DE MARVEL",
                    width: $("#grafico2").width(),
                    pieHole: 0.2
                };
                chart = new google.visualization.PieChart(document.getElementById("grafico2"));
                break;
        }
        chart.draw(data, chartOptions2);
    }
}
