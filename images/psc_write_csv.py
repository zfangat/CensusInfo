import pandas as pd
import pyodbc
import os
import logging
from datetime import datetime, timedelta

log_timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
log_name = 'MDW_csv_log_' + log_timestamp + '.log'
logging.basicConfig(filename = '//nsc-isln-01-smb.nas.ssa.gov/ACE/Projects/MDW/temp/log_csv/{}'.format(log_name), level = logging.DEBUG, format = "%(asctime)s:  %(levelname)s:  %(message)s")

logging.info('Write csv program started...')
logging.info('MDW SQL connnection established...')

def writeFO(key, df):
    # path = './'
    path = r'//nsc-isln-01-smb.nas.ssa.gov/ace/production/mdw/extract/New/'
    file = key + '.csv'
    if file in os.listdir(path):
        yesterday = datetime.now() - timedelta(days=1)
        yesterday = str(yesterday.strftime('%m%d%Y'))
        os.rename(path + file, path + key + "-" + yesterday + '.csv')
    df.to_csv(path + file, index=False)

try:
	sqlconn = pyodbc.connect('DSN=MDWSQL; UID=097013; PWD=097ACE013#')
	sqlcursor = sqlconn.cursor()

	logging.info('Query started...')
	tSQLlist = pd.read_sql('select * from dbo.mdwdaily where newdt=CONVERT(date, getdate())', sqlconn)
	logging.info('Query ended!')

	sqlcursor.close()
	sqlconn.close()
	logging.info('MDW SQL connnection closed.')

	gb = tSQLlist.groupby('fo')
	gd = {key:value for (key,value) in gb}
	
	logging.info('Start writing csv files...')
	for key, val in gd.items():
		writeFO(key, val)
	logging.info('Finished writing csv files, program complete!')
except:
	logging.exception('')

	
