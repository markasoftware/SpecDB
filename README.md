This branch identifies missing CPUs

It also serves as a quick fix for the pcpartrank ranker, as it finds benchmark results for the missing cpus too.

run make, then run the python file in tmp, then run make again.

TODO
* make a file of known missing cpus, so next time its ran we dont miss any of the missing ones alreadp found. (geekbench has a limit on their table so as new cpus get on it, others get pushed off)