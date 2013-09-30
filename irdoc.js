$(function(){
	$("#irSearch").click(function(){
		var title = "",
			source = "",
			content = "",
			params = "",
			rx_content = "",
			rx_title = "",
			rx_source = "",
			conEx= "",
			srcEx="",
			regEx="",
			recLimit = "";
	
		title = $("#title").val();
		source = $("#source").val();
		content = $("#content").val();
		recLimit = $("#recLimit").val();
		
		rx_title = $("#title_RX").is(":checked");
		rx_source = $("#source_RX").is(":checked");
		rx_content = $("#content_RX").is(":checked");		

		regEx = (rx_title === true) ? "title_reg=" : "title=";
		conEx = (rx_content === true) ? "content_reg=" : "content=";
		srcEx = (rx_source === true) ? "source_reg=" : "source=";		
		recLimit
		params = regEx + title +"&"+ srcEx + source +"&"+conEx + content+"&limit="+ recLimit ;
		loadTable(params)
	});
	
	var loadTable = function(data){
		$.ajax({
			url:"http://localhost:8080/?operId=1&skip=0",
			type:"GET",
			data: (data != undefined) ? data : "",
			dataType:"json",
			success: function(res) {
				var dataLen = res.length;
					rows = "",
					date = "";
					
				for(var i=0; i< dataLen; i++) {
					date = (res[i].date == undefined) ? "" : res[i].date;
					rows += "<tr>"
							+"<td >"+ res[i]._id+"</td>"
							+"<td title='"+ res[i].title +"'>"+ res[i].title.substring(0,40)+"</td>"
							+"<td>"+ res[i].source+"</td>"
							+"<td>"+ date +"</td>"
							+"<td>"+ res[i].urls+"</td>"
							+"<td title='"+ res[i].content +"'>"+ res[i].content.substring(0,50)+"</td>"																												
							+"</tr>" 
				}
				$("#irdocTable tbody tr").remove();				
				$("#irdocTable tbody").append(rows);
			},
			error: function(e) {
				console.log(e.responseText);
			}
		})
	}//End of loadTable function.
	
	loadTable();
	
});//End of the ready function.
