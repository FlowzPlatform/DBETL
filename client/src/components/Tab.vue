<template>
  <div class="tab"> 
    <Tabs type="card" closable @on-tab-remove="handleTabRemove" @on-click="fetchname" :value="activetab">
    	<TabPane :icon="getIcon(tab.type)" v-for="(tab, inx) in tabsdata" :key="tab.url" :label="tab.name" :name="inx.toString()"></TabPane>
    </Tabs>
  </div>
</template>
<script>
/*eslint-disable*/
export default {
  name: 'tab',
  computed: {
    tabsdata () {
      this.activetab = (this.$store.state.activetab).toString()
      return this.$store.state.tabdata
    }
  },
  mounted () {
  },
  data () {
    return {
      activetab: ''
    }
  },
  methods: {
    handleTabRemove (name) {
    	name = parseInt(name)
      // console.log("name!!!!!",name)
    	this.activetab = parseInt(this.activetab)
    			if(name == this.activetab)
    			{

    				// alert('name=active')	
    				if(name == 0){
    					if(this.$store.state.tabdata[parseInt(this.activetab)+1] !== undefined){
    						// alert('inside')
    						// alert(this.activetab)
                // console.log("@@@@@@@@",this.activetab)
    						this.activetab = 0
                this.$store.state.activetab = 0
              console.log("$$$$$$$$$$$$$$$$",this.activetab , this.$store.state.activetab)

						    // var deldobj = this.$store.state.tabdata.splice(name, 1)
                this.$store.dispatch('delTabIndex', {index: name})
					  	    this.$router.push(this.$store.state.tabdata[this.activetab].url)	
                  console.log("##############",this.$store.state.tabdata[this.activetab].url)
	    				}
	    				else {
	    					// this.$store.state.activetab = this.$store.state.activetab - 1
	    					// var deldobj = this.$store.state.tabdata.splice(name, 1)
                this.$store.dispatch('delTabIndex', {index: name})
	    					this.$router.push('/')
	    				}
    				}
    				else {
              // console.log("@@@@@@@@",this.activetab)
    					this.activetab -= 1
	    				this.$store.state.activetab = this.$store.state.activetab - 1
	    				console.log("$$$$$$$$$$$$$$$$",this.activetab , this.$store.state.activetab)
					    // var deldobj = this.$store.state.tabdata.splice(name, 1)
                this.$store.dispatch('delTabIndex', {index: name})
				  	    this.$router.push(this.$store.state.tabdata[this.activetab].url)
    				}
    			}
    			else {
    				// if(name == 0) {
    				// 	// var deldobj = this.$store.state.tabdata.splice(name, 1)
        //         this.$store.dispatch('delTabIndex', {index: name})
					  	// this.$router.push(this.$store.state.tabdata[this.activetab].url)
    				// }
    				 if(name > this.activetab) {
    					// this.$store.state.activetab = this.$store.state.activetab
						// var deldobj = this.$store.state.tabdata.splice(name, 1)
                this.$store.dispatch('delTabIndex', {index: name})
					  	this.$router.push(this.$store.state.tabdata[this.activetab].url)
    				}
    				else if(name < this.activetab) {
    					this.activetab -= 1
    					this.$store.state.activetab = this.$store.state.activetab - 1
						// var deldobj = this.$store.state.tabdata.splice(name, 1)
              this.$store.dispatch('delTabIndex', {index: name})
					  	this.$router.push(this.$store.state.tabdata[this.activetab].url)
    				}
    			}
    },
    fetchname (name) {
      // alert('Success' + name)
      name = parseInt(name)
      this.activetab = (name).toString()
      this.$store.state.activetab = name
      this.$router.push(this.$store.state.tabdata[name].url)
    },
    getIcon (type) {
      if (type === 'list')
      {
        return 'navicon'
      } else if (type === 'edit') {
        return 'edit'
      }
      // alert(type)
    }
  }
}
</script>
