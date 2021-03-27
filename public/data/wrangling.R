library(tidyverse)
data <- read.csv('/Users/xavier/Downloads/svelte-scrolly-master/public/data/data.csv') %>%
  rename('any'="Any",
         "pacients"="Suma.de.pacients",
         "visites"="Suma.de.visites",
         "nse_baix"="Nse_baix",
         "nou_pacient"="Nou_pacient")

data %>% 
  pivot_wider(id_cols=c('aga','rs','any'),
            names_from=c('sexe','nse_baix','nou_pacient','pcsm','pccsm'),
            names_sep=".",
            values_from=c('visites','pacients'),
            values_fill=0,
            values_fn = sum) 

write.csv(data,"/Users/xavier/Downloads/svelte-scrolly-master/public/data/data.csv" )  
            
            

