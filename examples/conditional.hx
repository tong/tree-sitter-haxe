#if debug
trace("ok");
#elseif !other
#elseif another
#elseif (debug_level > 3)
#elseif 0 == 0
#elseif 0 != 0
#elseif 0 > 0
#elseif 0 < 0
#elseif 0 <= 0
#elseif 0 >= 0
#elseif (a && b)
#elseif (a || b) && ( c > d || (e!=f))
#else
#end
