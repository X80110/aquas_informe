
<script>
import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
import Section from "./Section.svelte";
</script>
<Section>
<Tabs>
    <TabList>
      <Tab>2019</Tab>
      <Tab>2018</Tab>
      <Tab>2017</Tab>
      <Tab>2016</Tab>
    </TabList>
   
    <TabPanel>
      <h4>2019 · Pacients ateses als centres de salut mental infantojuvenils</h4>
      <iframe width="100%" height="520" frameborder="0" src="https://x80110.carto.com/builder/69b68982-f518-404b-9cb2-f723ae856d51/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>
    </TabPanel>
   
    <TabPanel>
      <h4>2018 · Pacients ateses als centres de salut mental infantojuvenils</h4>
        <iframe width="100%" height="520" frameborder="0" src="https://x80110.carto.com/builder/4db0dafe-f05e-44d2-87f5-b27bc3dd1149/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>
    </TabPanel>
   
    <TabPanel>
      <h4>2017 · Pacients ateses als centres de salut mental infantojuvenils</h4>
        <iframe width="100%" height="520" frameborder="0" src="https://x80110.carto.com/builder/62da91fb-5713-40b0-bfcc-8a5bfe32565d/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>
    </TabPanel>

    <TabPanel>
      <h4>2016 · Pacients ateses als centres de salut mental infantojuvenils</h4>
        <iframe width="100%" height="520" frameborder="0" src="https://x80110.carto.com/builder/c0a9b5aa-83e4-4586-a64c-205b337ae8eb/embed" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>
    </TabPanel>
  </Tabs>
</Section>