<?php
	#Генерирует простую веб страничку с сылками на видео
	$start_pos = 0;
	$vid_count = 10;

	if ($_GET['start'])
		$start_pos = $_GET['start'];
	if ($_GET['count'])
		$vid_count = $_GET['count'];

	#Вызов функции соединения с базой данных
	db_connect();
	#Задание переменной с именем таблицы с данными
	$sql_table="vkdata";

	$unic_id = array();
	$id = array(); 
	$owner_id = array(); 
	$photo = array(); 
	$url_to_player = array(); 
	$result = mysql_query("SELECT unic_id, id, owner_id, photo320, url_to_player FROM vkdata WHERE unic_id > ". $start_pos." LIMIT 0 ,". $vid_count ); 
	while($myrow = mysql_fetch_assoc($result)) { 
		$unic_id[] = $myrow['unic_id'];
		$id[] = $myrow['id']; 
		$owner_id[] = $myrow['owner_id']; 
		$photo[] = $myrow['photo320']; 
		$url_to_player[] = $myrow['url_to_player']; 
	} 

	$str = "";
	for ($i = 0; $i < count($id); $i += 2) {
		$videoURL = "http://vk.com/video". $owner_id[$i] ."_". $id[$i];
		
		$img = "<img width=\"320\" height=\"240\" src=\"". $photo[$i] ."\">";
		$str .= "<a href=\"". $videoURL ."\">". $img ."</a>";

		$img = "<img width=\"320\" height=\"240\" src=\"". $photo[$i+1] ."\">";
		$str .= "<a href=\"". $videoURL ."\">". $img ."</a>";


		$str .= "<iframe src=\"". $url_to_player[$i] ."\" width=\"320\" height=\"240\"></iframe>";
		$str .= "<iframe src=\"". $url_to_player[$i+1] ."\" width=\"320\" height=\"240\"></iframe>";

		//if ($i%2==0)
		$str .= " id: ". $unic_id[$i] ." ";
		$str .= "<br>";
	}
	
	include("form.html");
	print_r($str);


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