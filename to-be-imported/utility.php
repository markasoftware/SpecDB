<?php
function listFolderFiles($dir){
    $ffs = scandir($dir);

    unset($ffs[array_search('.', $ffs, true)]);
    unset($ffs[array_search('..', $ffs, true)]);

    // prevent empty ordered elements
    if (count($ffs) < 1)
        return;

    echo '<ol>';
    foreach($ffs as $ff){
        echo '<li>'.$ff;
        if(is_dir($dir.'/'.$ff)) listFolderFiles($dir.'/'.$ff);
        echo '</li>';
    }
    echo '</ol>';
}

function stripString(string $string): string
{
    $string = str_replace('NVIDIA ', '', $string);
    return str_replace(' ', '-', $string);
}

function getArrayFolderFiles(string $dir, bool $fullPath = false): array
{
    // echo ("getArrayFolderFiles: dir: ". $dir. "  fullPath: ". $fullPath);
    $result = [];
    $ffs = scandir($dir);

    unset($ffs[array_search('.', $ffs, true)]);
    unset($ffs[array_search('..', $ffs, true)]);

    // prevent empty ordered elements
    if (count($ffs) < 1)
        return [];

    foreach($ffs as $ff){
        if (is_dir($dir.'/'.$ff))
        {
            $result = array_merge($result, getArrayFolderFiles($dir.'/'.$ff, $fullPath));
        } else {
            if ($fullPath === false) {
                $result[] = $ff;
            } else {
                $result[$dir][] = $ff;
            }
        }
    }
    // echo (PHP_EOL."result:". json_encode($result).PHP_EOL);
    return $result;
}

function csvNameToSpecDb(string $name): string
{
    $name = str_replace('Super', 'SUPER', $name);
    $name = str_replace('Laptop', 'Mobile', $name);
    $name = str_replace('-(all-variants)', '.*', $name);
    $name = str_replace('(all-variants)', '.*', $name);
    // $name = str_replace('-', '\-', $name);
    return '/^'.$name.'.yaml$/';
}

function generateLines(array $line): string
{
    $keys = [
    "H.264 (AVCHD) YUV 4:2:0",
    "H.264 (AVCHD) YUV 4:2:2",
    "H.264 (AVCHD) YUV 4:4:4",
    "H.264 (AVCHD) Lossless",
    "H.265 (HEVC) 4K YUV 4:2:0",
    "H.265 (HEVC) YUV 4:2:2",
    "H.265 (HEVC) 4K YUV 4:4:4",
    "H.265 (HEVC) 4K Lossless",
    "H.265 (HEVC) 8K",
    "HEVC 10-bit support",
    "HEVC B Frame support",
    "AV1 YUV 4:2:0",
    ];
    $result = PHP_EOL."  Hardware Accelerated Encoding:";
    foreach ($keys as $key) {
        if ($line[$key] === 'YES') {
            $result = $result . PHP_EOL . "    - ".$key;
        }
    }
    // echo $result;
    return $result;
}

function slitLine($line): array
{
    $multipleRules = str_contains('/', $line["BOARD"]) || str_contains('>', $line["BOARD"]);

    $result = [];
    $firstFullName = implode(['/','>'],$line["BOARD"])[0];
    $lineCopied = $line;
    $lineCopied["BOARD"] = $firstFullName;
    $result[] = $lineCopied;

    $scannedDirectory = scandir(__DIR__.'/../specs/GPUs-CONSUMER/Nvidia');
    $familyFolderNames = [];
    foreach ($scannedDirectory as $thing) {
        if (is_dir($thing) && !(str_contains($thing, '.'))) {
            $familyFolderNames[] = $thing;
        }
    }

    $matchedFamilies = [];
    // match line['FAMILY'] with $familyFolderNames
    foreach ($familyFolderNames as $family) {
        if (str_contains($family, preg_replace('/\(.*\)/', '', $line['FAMILY']))) {
            $matchedFamilies[] = $family;
        }
    }

    // take off the last token from the $firstFullName and append the splitted name
    // if match, we have a match
    // if not match, take off another token like above and try match again, no more tokens? no match

    // for > operators
    // get the last token of both sides, regex the number difference
    // 850m > 960m
    // to 
    // [8-9][5-6]0m

    return $result;
}

function getFilePathsForFileName(string $name, string $pathToSearch =  __DIR__.'/../specs/GPUs-CONSUMER/Nvidia'): array
{
    $result = [];
    $paths = getArrayFolderFiles($pathToSearch, true);
    foreach($paths as $folderDir => $fileNames) {
        if (is_array($fileNames)){
            foreach ($fileNames as $fileName) {
                if ($fileName == $name) {
                    $result[] = $folderDir.DIRECTORY_SEPARATOR.$name;
                }
            }
        } else {
            if ($fileNames == $name) {
                $result[] = $folderDir.DIRECTORY_SEPARATOR.$name;
            }
        }
    }
    return $result;
}
