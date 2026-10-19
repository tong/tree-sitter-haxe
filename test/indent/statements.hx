class S {
	function f() {
		if (a) {
			b();
		} else if (c) {
			d();
		} else {
			e();
		}
		if (a)
			b();
		else if (c)
			d();
		else
			e();
		if (a)
			b();
		else if (c) {
			d();
		} else
			e();
		if (a) {
			b();
		} else
			c();
		try {
			f();
		}
		catch (e:Dynamic) {
			g();
		}
		for (i in 0...n) {
			trace(i);
		}
		for (i in 0...n)
			trace(i);
		while (x)
			x--;
		switch (v) {
			case 1:
				a();
			case 2 | 3:
				b();
				c();
			default:
				d();
		}
		try {
			f();
		} catch (e:Dynamic) {
			g();
		}
		try
			f()
		catch (e:Dynamic)
			g();
		call(
			a,
			b
		);
		var f = function() {
			return 1;
		};
		list.map(function(x) {
			return x + 1;
		});
		(a : Array<Int>).push(1);
		return new Map(
			a
		);
	}
}
