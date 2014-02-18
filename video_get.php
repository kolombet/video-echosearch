<?php
	$start_pos = 0;
	$vid_count = 100;

	if ($_GET['start'])
		$start_pos = $_GET['start'];
	if ($_GET['count'])
		$vid_count = $_GET['count'];

	#Вызов функции соединения с базой данных
	db_connect();
	#Задание переменной с именем таблицы с данными
	$sql_table="vkdata";

	$result = mysql_query("SELECT unic_id, id, owner_id, photo320, e_status, check_result FROM vkdata WHERE unic_id > ". $start_pos." ORDER BY unic_id ASC LIMIT 0 ,". $vid_count ); 

    //$data = array();
	while($myrow = mysql_fetch_assoc($result)) { 
		$res = array(
	        "unic_id" => $myrow['unic_id'],
	        "id" => $myrow['id'],
	        "owner_id" => $myrow['owner_id'],
	        "photo" => $myrow['photo320'],
	        "e_status" => $myrow['e_status'],
	        "check_result" => $myrow['check_result']
	    );
	    $data[] = $res;
	} 
    
    
        
    header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST'); 
	echo(json_encode($data));

    
	#Функция соединения с базой данных
	function db_connect(){
		include_once('echoprint_base.php');
		
		#соединение с сервером
		mysql_connect($serv,$user,$pass) or die("Not connected...".mysql_error());
		#установка кириллицы
		mysql_query("SET NAMES CP1251");
		mysql_query("SET COLLATION_CONNECTION=CP1251_GENERAL_CI");
		#выбор базы данных
		mysql_select_DB($DB) or die("Base is not selected...".mysql_error());
	}

	# функция выборки всех записей из таблицы базы данных
	function full_info_from_base ($table){
		# условие выборки данных
		$query_string="select * from `$table`";
		# выборка из таблицы
		$get_date=mysql_query($query_string) or die(mysql_error());
		# сортировка выбранных данных по ключевым полям
		for($get_table=array();$row=mysql_fetch_assoc($get_date);$get_table[]=$row);
		# возвращение выбранных значений скрипту
		return $get_table;
	}
?>