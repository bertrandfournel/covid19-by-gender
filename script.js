/*
* Auteur / Author : Bertrand Fournel
*
* Ecrit le 1er mai 2020 / Written on May 1st, 2020
*
* Je suis à la recherche d'un travail de développeur, n'hésitez pas à me contacter :)
* I'm looking for job as a developer, don't hesitate to contact me :)
*
*/

window.onload = () => {
    const delimiter = ";"
    var graphTitle = ""
    const colorBlue = 'rgba(50, 104, 168, 0.5)'
    const colorRed= 'rgba(240, 104, 89, 0.5)'
    const url = 'https://www.data.gouv.fr/fr/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7'
    var dates = []
    var arrDataMens = []
    var arrDataWomens = []
    
    
    getData().then(response =>{
        // Après avoir récupérer les données on compte le nombre de cas en fonction du sexe et du thème (décès ou réa...) puis on le retourne dans un array
        function countByGenderAndTheme(genderId, themeId){
            let arr = []
            for (let i = 0; i < dates.length; i++){
                let count = 0
                for(let j = 0; j < response[i].length; j++){
                    if(response[i][j][1] == genderId){
                        count += response[i][j][themeId]
                    }
                }
                arr.push(count);
            }
            return arr;
        }
        
        var btnHospi = document.getElementById("hospi");
        btnHospi.onclick = () => {
            arrDataMens = countByGenderAndTheme(1, 3)
            arrDataWomens = countByGenderAndTheme(2,3)
            graphTitle = "Hospitalisations"
            chartIt(arrDataMens, arrDataWomens)
        }

        var btnRea = document.getElementById("rea");
        btnRea.onclick = () => {
            arrDataMens = countByGenderAndTheme(1, 4)
            arrDataWomens = countByGenderAndTheme(2,4)
            graphTitle = "Réanimations"
            chartIt(arrDataMens, arrDataWomens)
        }

        var btnRad = document.getElementById("rad");
        btnRad.onclick = () => {
            arrDataMens = countByGenderAndTheme(1, 5)
            arrDataWomens = countByGenderAndTheme(2,5)
            graphTitle = "Retours à domicile"
            chartIt(arrDataMens, arrDataWomens)
        }

        var btnDC = document.getElementById("dc");
        btnDC.onclick = () => {
            arrDataMens = countByGenderAndTheme(1, 6)
            arrDataWomens = countByGenderAndTheme(2,6)
            graphTitle = "Décès"
            chartIt(arrDataMens, arrDataWomens)
        }
        
        
    })
   

    function chartIt(arrDataMensArg, arrDataWomensArg){       
            canvas = document.getElementById("myChart")
            var ctx = canvas.getContext('2d');
            var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Hommes',
                    data: arrDataMensArg,
                    backgroundColor: colorBlue
                },
                {
                    label: 'Femmes',
                    data: arrDataWomensArg,
                    backgroundColor: colorRed
                }],
            },
            options: {
                events: [],
                title :{
                    display : true,
                    text : graphTitle
                },
                responsive : true,
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
            });
    }  
    //Cette fonction nous permet de récupérer les données de manière asynchrone
    async function getData(){
        const response =  await fetch(url)
        const data = await response.text()
        const rows = data.split('\n').slice(1,-1)
        var rowCleaned = []
        const arrRow = []

        // Ici on va nettoyer les données, pour avoir une array propre (nommé arrRow)
        rows.forEach(e => {
            const row = e.split(delimiter)
            const dept = row[0].slice(1,-1)

            // Il y a une erreur dans la source, la variable sexe comporte sur la journée du 24/03 des "" en trop, il faut nettoyer cela
            let sexeStr = "" //On crée une variable string qui servira de tampon
            if (row[1].length == 3){ // on vérifie le nombre de caractères, si il y a "1" au lieu de 1 alors il y a 3 caractères
                sexeStr = row[1].slice(1,-1)// On enlève les ""
            }else{
                sexeStr = row[1]// si il n'y a pas de ""
            }

            const sexe = parseInt(sexeStr)
            const date = row[2].slice(1,-1)
            const hospi = parseInt(row[3])
            const rea = parseInt(row[4])
            const rad = parseInt(row[5])
            const deces = parseInt(row[6])

            // Autre erreur dans la source, des lignes ne comporte pas de numéros de départements, on les supprime
            if (dept == ""){
                //console.log("missing info")
            }else{
                rowCleaned.push(dept, sexe, date, hospi, rea, rad, deces)
                arrRow.push(rowCleaned)
                rowCleaned = []
            }
        })
        
        //On crée un deuxième array "dates" de toutes les journées avec une mise en forme correcte
        for(let i = 0; i < arrRow.length; i += 303){
            const date = arrRow[i][2]
            const day = date.slice(-2)
            const month = date.slice(5,7)
            const year = date.slice(0,4)
            const dateCleaned = day+"/"+month+"/"+year
            dates.push(dateCleaned)
        }

        // On modifier une dernière fois l'ensemble des données pour les classer par jour
        let arrCleanByDays = []
        for (let i = 0; i < arrRow.length; i+=303){
            let arrTemp = arrRow.slice(i,i+303)
            arrCleanByDays.push(arrTemp)
            arrTemp = []
        }
        
        return arrCleanByDays
    }
}
