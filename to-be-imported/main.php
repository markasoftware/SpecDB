<?php

require './utility.php';

function addDataToPart(array $line, string $pathToSearch =  __DIR__.'/../specs/GPUs-CONSUMER/Nvidia'): bool
{
    // we know we are importing fram nvidia
    // and consumor for this test
    $dir = $pathToSearch;
    $fileNames = getArrayFolderFiles($dir);
    $name = stripString($line["BOARD"]);
    $convertedName = csvNameToSpecDb($name);
    $found = [];
    foreach ($fileNames as $fileName) {
        // echo 'filename: '. $fileName. '; matcher: '.$name.';;';
        if(preg_match($convertedName, $fileName)) {
            $found[] = $fileName;
        }
    }
    echo(json_encode(['name' => $name, 'found' => count($found), 'foundValues' => json_encode($found)]));
    echo (PHP_EOL);
    if (count($found) === 0) {
        return false;
    }
    foreach ($found as $fileName) {
        $generatedLines = generateLines($line);
        $filePaths = getFilePathsForFileName($fileName, $dir);
        foreach($filePaths as $filePath) {
            $contents = file_get_contents($filePath);
            $splitContents = explode("data:",$contents);
            $newContents = $splitContents[0].'data:'.$generatedLines.$splitContents[1];
            file_put_contents($filePath, $newContents);
        }
    }
    return true;

}

function main(string $fileDirectory = "consumer")
{
    $searchFolder = __DIR__.'/../specs/GPUs-CONSUMER/Nvidia';
    if ($fileDirectory == "consumer") {
        $fileDirectory =  __DIR__.'/NVENC-encoding/Consumer.csv';
        $searchFolder = __DIR__.'/../specs/GPUs-CONSUMER/Nvidia';
    } elseif ($fileDirectory  =="server") {
        $fileDirectory =  __DIR__.'/NVENC-encoding/Server.csv';
        $searchFolder = __DIR__.'/../specs/GPUs-SERVER/Nvidia';
    } else if ($fileDirectory == "dgx") {
        $fileDirectory =  __DIR__.'/NVENC-encoding/dgx.csv';
        $searchFolder = __DIR__.'/../specs/GPUs-SERVER/Nvidia';
    } elseif ($fileDirectory == "professional") {
        $fileDirectory =  __DIR__.'/NVENC-encoding/Professional.csv';
        $searchFolder = __DIR__.'/../specs/GPUs-CONSUMER/Nvidia';

    }

    //read csv
    $file = $fileDirectory;
    $csv = array_map('str_getcsv', file($file));
    array_walk($csv, function(&$a) use ($csv) {
        $a = array_combine($csv[0], $a);
    });
    array_shift($csv); # remove column header

    foreach ($csv as $line) {
        // echo 'board: '.$line["﻿BOARD"];
        // foreach($line as $key => $array) {
        //     echo '<br>key: '.var_dump($key);
        //     echo '<br>value'.$array;
        // }

        // seperate the /
        // for example: GeForce GTX 960 Ti / 970 / 980
        // find the GeForce GTX 960 Ti in the specs folder in yamls with 
        // type: Graphics Architecture
        // look for the other variations in that same file with the match
        // keep a log af ones it cannot find.
        if (array_key_exists("﻿BOARD",$line)) {
            $line['BOARD'] = $line["﻿BOARD"];
        }
        if (preg_match('/>|\//',$line["BOARD"]) === 1) {
            $line['multipart'] = true;
        } else {
            $line['multipart'] = false;
        }

        if ($line['multipart'] === false) {
            addDataToPart($line, $searchFolder);
        } else {
            $splitLines = splitLine($line);
            foreach ($splitLines as $splitLine) {
                addDataToPart($splitLine);
            }
        }

        // same process as above for the >
        // use regex to find the last few numbers of the name, and range it with the numbers of the last range.
    }
}


main('consumer');
main('server');
main('dgx');
main('professional');
