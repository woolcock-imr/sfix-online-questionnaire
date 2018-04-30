//-------------------------------------
var this_module			=$vm.module_list[$vm.vm['__ID'].name];
var prefix				=this_module.prefix;
var form_tid      		=this_module.table_id;
var participant_tid     ="";
if($vm.module_list[prefix+'participant']!=undefined) participant_tid=$vm.module_list[prefix+'participant'].table_id;
if($vm.module_list[prefix+'participant-data']!=undefined) participant_tid=$vm.module_list[prefix+'participant-data'].table_id;
var participant_sql		="Convert(varchar,UID)+'-'+JSON_VALUE(Information,'$.Screening_ID')";
//-------------------------------------
if(participant_tid!=undefined){
	var sql="with tb as (select name="+participant_sql+",value2=uid from [TABLE-"+participant_tid+"])";
	sql+=" select top 10 name,value=name,value2 from tb where Name like '%'+@S1+'%' ";
	$vm.autocomplete($('#Participant__ID'),sql,function(key,value){
		$("#F__ID input[name="+key+"]").val($vm.text(value));
	})
}
//-------------------------------------
$('#D__ID').on('load',function(){
	$('#F__ID')[0].reset();
	$('#submit__ID').show();
	var input=$vm.vm['__ID'].input;
	var grid_record="";	if(input!=undefined) grid_record=input.record;
	$vm.deserialize(grid_record,'#F__ID');
	//--------------------------
	if($("#F__ID input[name=Participant]").val()=='' && input!=undefined){
		$("#F__ID input[name=Participant]").val(input.participant_name);
		$("#F__ID input[name=Participant_uid]").val(input.participant_uid);
	}
	if($vm.online_questionnaire===1) $('#row_participant__ID').hide();
	$("#F__ID input[name=Participant]").prop('disabled',false); if($("#F__ID input[name=Participant]").val()!='') $("#F__ID input[name=Participant]").prop('disabled',true);
	//--------------------------
	if(typeof(on_load)!='undefined') on_load();
})
//-------------------------------------
var _before_submit=function(record,dbv){
	if(typeof(before_submit)!='undefined') before_submit(record,dbv);
	dbv.PUID=record.Participant_uid;
	dbv.S3=$vm.status_of_data(record);
	if(dbv.PUID==''){
		$vm.alert('No participant was selected.');
		$('#submit__ID').show();
		return false;
	}
	return true;
};
//-------------------------------------
$('#F__ID').submit(function(event){
	//--------------------------------------------------------
	event.preventDefault();
	$('#submit__ID').hide();
	//--------------------------------------------------------
	var data=$vm.serialize('#F__ID'); var dbv={}
	if(_before_submit(data,dbv)==false) return;
	//--------------------------------------------------------
	var rid=undefined; if($vm.vm['__ID'].op.record!=undefined) rid=$vm.vm['__ID'].op.record.ID;
	var sql;
	if($vm.online_questionnaire!=1){
		req={cmd:"add_json_record",db_pid:form_tid,data:data,dbv:dbv};
		if(rid!=undefined) req={cmd:"modify_json_record",rid:rid,db_pid:form_tid,data:data,dbv:dbv};
	}
	else{
		req={cmd:"add_json_record_s2",db_pid:form_tid,data:data,dbv:dbv};
		if(rid!=undefined) req={cmd:"modify_json_record_s2",rid:rid,db_pid:form_tid,data:data,dbv:dbv};
	}
	$VmAPI.request({data:req,callback:function(res){
		$vm.refresh=1;
		if(rid!=undefined) window.history.go(-1);
		else if($vm.vm['__ID'].input!=undefined && $vm.vm['__ID'].input.goback!=undefined) window.history.go(-1);
		else $vm.alert('Your data has been successfully submitted');
	}});
	//--------------------------------------------------------
})
//--------------------------------------------------------
