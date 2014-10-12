Number.prototype.leftZeroPad = function(numZeros) {
        var n = Math.abs(this);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if( this < 0 ) {
                zeroString = '-' + zeroString;
        }
        return zeroString+n;
};

Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
  var angle = Math.atan2(x1-x2,y2-y1);
  angle = (angle / (2 * Math.PI)) * 360;
  var arrowPath = this.path("M" + x2 + " " + y2 + " L" + (x2  - size) + " " + (y2  - size) + " L" + (x2  - size)  + " " + (y2  + size) + " L" + x2 + " " + y2 ).attr("fill","black").rotate((90+angle),x2,y2);
  var linePath = this.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2);
  return [linePath,arrowPath];
};


Raphael.fn.pertChart = function (p, wd) {
    var paper = this;
    var taskCountParents = function ( t, ts, count ) {
        if ( ! count ) count = 0;
        if ( t.parent === null ) return count;
        for ( var i in ts ) {
            if ( ts[i].id == t.parent ) {
                t = ts[i];
                count++;
                return taskCountParents( t, ts, count);
            }
        }
    };
    
    var taskDurationParents = function ( t, ts, d) {
        if ( !d ) d = 0;
        if ( t.parent === null ) return d;
        for ( var i in ts ) {
            if ( ts[i].id == t.parent ) {
                t = ts[i];
                d+=t.duration;
                return taskDurationParents(t, ts, d);
            }
        }
    };
    
    var taskDisplay = function(r, t, x, y, w, h, db, de, c) {
        
        var display_begin = db.getFullYear()+'-'+(db.getMonth()+1).leftZeroPad(2)+'-'+db.getDate().leftZeroPad(2);
        var display_end = de.getFullYear()+'-'+(de.getMonth()+1).leftZeroPad(2)+'-'+de.getDate().leftZeroPad(2);
        
        var name = (t.name.length > 10) ? t.name.substr(0,10)+'...' : t.name ;

        // Draw structure
        
        var b = r.rect(x, y, w, h).toBack();
        var l1 = r.path("M"+(x)+" "+(y+30)+"H"+(x+w));
        var l2 = r.path("M"+(x)+" "+(y+60)+"H"+(x+w));
        if ( c ) {
            b.attr({stroke: "#ff0000"});
            l1.attr({stroke: "#ff0000"});
            l2.attr({stroke: "#ff0000"});
        } else {
            b.attr({stroke: "#000000"});
            l1.attr({stroke: "#000000"});
            l2.attr({stroke: "#000000"});
        }
        
        //Draw informations
        r.text(x+10, y+15, "ID : "+t.id)
            .attr(
                {"text-anchor":"start",
                "font-family":"Verdana, Arial, serif",
                "font-size":"14",}
            );
        r.text(x+(w/2), y+15, name)
            .attr(
                {"text-anchor":"start",
                "font-family":"Verdana, Arial, serif",
                "font-size":"14"}
            );
        r.text(x+10, y+15+30, "Begin : "+display_begin)
            .attr(
                {"text-anchor":"start",
                "font-family":"Verdana, Arial, serif",
                "font-size":"11"}
            );
        r.text(x+(w-10), y+15+30, "Duration : "+t.duration)
            .attr(
                {"text-anchor":"end",
                "font-family":"Verdana, Arial, serif",
                "font-size":"11"}
            );
        r.text(x+10, y+15+60, "End : "+display_end)
            .attr(
                {"text-anchor":"start",
                "font-family":"Verdana, Arial, serif",
                "font-size":"11"}
            );
    }
    
    var tasksShow = function (r, p ) {
      if (!p) return;
      if (!p.tasks) return
        var daysToHours = function(duration, work_day_duration) {
            var days = Math.floor(duration);
            var hours10 = (duration - days) * work_day_duration;
            var hours = Math.floor( hours10 );
            var minutes = (hours10 - hours) * 60;
            
            var ret = { 'days': days, 'hours' : hours, 'minutes' : minutes };
            
            return ret;
        };
    
        
        var w = 220;
        var h = 90;
        var ts = p.tasks;
        var onp = taskCountParents( ts[ts.length-1], ts )+1;
        
        var db = new Date(parseInt(p.begin));
        var de = new Date(parseInt(p.end));
        
        var st = {id: 0,
            name: 'Start',
            duration: 0,
            parent: null}
        
        // Display start
        taskDisplay(r,st,10,10,w,h,db,db,true);
        
        var dtb = new Date(parseInt(p.begin)), dtbs = {};
        var dte = new Date(parseInt(p.end)), dtes = {};
        var odte = new Date(dte);
        var od = 0;
        var cs = {};

        for (var i=ts.length-1; i>=0; i--) {

            var t = ts[i];
            
            var np = taskCountParents( t, ts );
            if ( onp != np) od = 0;
            
            // check if criticial
            if ( t.duration > od ) {
                od = t.duration;
                cs[i] = true;
                cs[i+1] = false;
            } else {
                cs[i] = false;
            }
            
            // check if we change of level
            if ( onp != np) {
                odte = new Date(dte);
                onp = np;
            } else {
                od = 0;
            }
            
            // update end time
            var dte_duration = daysToHours(t.duration, wd);
            dte.setDate( odte.getDate() - dte_duration.days);
            dte.setHours( odte.getHours() - dte_duration.hours);
            dte.setMinutes( odte.getMinutes() - dte_duration.minutes);
            
            dtes[i] = new Date(dte);
        }
        
        for ( var i=0; i < ts.length; i++ ) {
            
            var t = ts[i];
            
            // update beginning
            var dtb_duration = daysToHours(t.duration, 8);
            dtb.setDate( dtb.getDate() + dtb_duration.days);
            dtb.setHours( dtb.getHours() + dtb_duration.hours);
            dtb.setMinutes( dtb.getMinutes() + dtb_duration.minutes);
            
            dtbs[i] = new Date(dtb);
            
        }
        
        for ( var i=0, j=0; i < ts.length; i++,j++ ) {
            var t = ts[i];
            var np = taskCountParents( t, ts );
            if ( onp != np) {
                j = 0;
                onp = np;
            }
            taskDisplay(r,t,10+(np+1)*(w+20),10+j*(h+20),w,h, dtbs[i], dtes[i], cs[i]);
            r.arrow(10+(20*(np))+w*(np+1),10+(h/2),(w+20)*(np+1)+10,10+(h/2)+(j*h),4);
        }
        r.arrow(30+w+(20*(np))+w*(np+1),10+(h/2),10+(onp+2)*(w+20),10+(h/2),4);
        var et = {id: 0,
            name: 'End',
            duration: 0,
            parent: null}
        // Display stop
        taskDisplay(r,et,10+(onp+2)*(w+20),10,w,h,de,de,true);
    }
    tasksShow( paper, p );
}
