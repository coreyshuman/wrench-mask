from nunchuck import nunchuck
import urllib2
import time as time

w = nunchuck()

while(true)
    val = 0
    w.raw()
    c = w.c_button()
    x = w.joystick_x()
    y = w.joystick_y()

    if y < 60
        val = 1
    elif y > 200 
        val = 3
    elif x < 60  
        val = 2
    elif x > 200 
        val = 4
    

    if val > 0 and c == true
        val = val + 4

    if val > 0
        print "show: " + str(val)
        urllib2.urlopen("http://localhost:3001/show/" + str(val)).read()

    time.sleep(0.2)
