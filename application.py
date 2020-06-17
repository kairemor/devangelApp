import os 
import subprocess

print(os.listdir())
my_env = os.environ.copy()
my_env['FLASK_APP'] = 'devangel'
os.chdir('api')
my_commande = ['flask', 'db', 'upgrade']
subprocess.Popen(my_commande, env=my_env)
os.chdir('..')
subprocess.run(['gunicorn','api:app'])

