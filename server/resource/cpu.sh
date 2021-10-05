#!/bin/bash
cpu=$(grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}')
mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
mem_free=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
echo "$cpu|$mem_total|$mem_free"