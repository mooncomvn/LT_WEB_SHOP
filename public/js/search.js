// function myFunction() {
//     var input, filter, table, tr, td, i, txtValue;
//     input = document.getElementById("myInput");
//     filter = input.value.toUpperCase();
//     table = document.getElementById("myTable");
//     tr = table.getElementsByTagName("tr");
//     for (i = 0; i < tr.length; i++) {
//       td = tr[i].getElementsByTagName("td")[0];
//       if (td) {
//         txtValue = td.textContent || td.innerText;
//         if (txtValue.toUpperCase().indexOf(filter) > -1) {
//           tr[i].style.display = "";
//         } else {
//           tr[i].style.display = "none";
//         }
//       }       
//     }
//   }

$(document).ready(function(){
    $('#myInput').on('keyup', function(event){
        event.preventDefault();
        var key = $(this).val().toLowerCase();
        $('#myTable tbody tr').filter(function(){
            $(this).toggle($(this).text().toLowerCase().indexOf(key) > -1);
        });
    });
});

$(document).ready(function(){
    $('#myInput2').on('keyup', function(event){
        event.preventDefault();
        var key2 = $(this).val().toLowerCase();
        $('#myTable2 div').filter(function(){
            $(this).toggle($(this).text().toLowerCase().indexOf(key2) > -1);
        });
    });
});


