#!/usr/bin/env python
# coding: utf-8

# In[1]:


from mxnet import nd
from mxnet.gluon import nn
import pickle as pk
import re
import matplotlib.pyplot as plt
import mxnet as mx
import pyodbc
import pandas as pd
import time
import logging
from datetime import datetime

current_dt = datetime.now()
log_dt = current_dt.strftime("%Y_%m_%d_%H_%M_%S")
log_name = 'MDW_log_' + log_dt + '.log'
logging.basicConfig(filename = '//nsc-isln-01-smb.nas.ssa.gov/ACE/Projects/MDW/temp/logs{}'.format(log_name), level = logging.DEBUG, format = "%(asctime)s:%(levelname)s:%(message)s")
logging.info('Scoring program started.')
	
start_time = time.time()


class TextCNN(nn.Block):
    def __init__(self, vocab, embed_size, kernel_sizes, num_channels,
                 **kwargs):
        super(TextCNN, self).__init__(**kwargs)
        self.embedding = nn.Embedding(len(vocab), embed_size)
        self.constant_embedding = nn.Embedding(len(vocab), embed_size)
        self.dropout = nn.Dropout(0.5)
        self.decoder = nn.Dense(y_shape)
        self.pool = nn.GlobalMaxPool1D()
        self.convs = nn.Sequential()  
        for c, k in zip(num_channels, kernel_sizes):
            self.convs.add(nn.Conv1D(c, k, activation='relu'))

    def forward(self, inputs):
        embeddings = nd.concat(
            self.embedding(inputs), self.constant_embedding(inputs), dim=2)
        embeddings = embeddings.transpose((0, 2, 1))
        encoding = nd.concat(*[nd.flatten(
            self.pool(conv(embeddings))) for conv in self.convs], dim=1)
        outputs = self.decoder(self.dropout(encoding))
        return outputs




import pickle as pk
caches_url = r'//nsc-isln-01-smb.nas.ssa.gov/ACE/Projects/MDW/temp/code/cachesMay30.sav'
caches = pk.load(open(caches_url,'rb'))
idx_to_token = caches['idx_to_token']
token_to_idx = caches['token_to_idx']
vocab = caches['vocab']
y_shape= caches['y_shape']
y_encoder = caches['y_encoder']
C_C = caches['C_C']
test_data = caches['test_data']

logging.info("import caches time: %f"%(time.time()-start_time))



embed_size, kernel_sizes, nums_channels = 50, [1, 2, 3, 4], [400, 100,100,50]
ctx = mx.cpu()
textnet = TextCNN(vocab, embed_size, kernel_sizes, nums_channels)





textnet.load_parameters(r'//nsc-isln-01-smb.nas.ssa.gov/ACE/Projects/MDW/temp/code/textnetJune4.params',ctx=ctx)

logging.info("import textnet time: %f"%(time.time()-start_time))



def get_similar_tokens(query_token, k, embed):
    W = embed.weight.data()
    x = W[token_to_idx[query_token.upper()]]
    # adding 1e-9 for stability
    cos = nd.dot(W, x) / (nd.sum(W * W, axis=1) * nd.sum(x * x) + 1e-9).sqrt()
    topk = nd.topk(cos, k=k+1, ret_typ='indices').asnumpy().astype('int32')
    for i in topk[1:]:  # delet the input
        print('cosine sim=%.3f: %s' % (cos[i].asscalar(), (idx_to_token[i])))




def clean_text(text,rgx,sep=''):
    return re.sub(rgx, sep, text)

def rid_of_regex(x,regex):
        if re.search(regex,x):
            return x[re.search(regex,x).span()[1]:]
        else:
            return x
        
def apply_regex(f,regex,x):
    return list(map(lambda x:f(x,regex),x))

def preprocess_mdw(data, vocab):
    """Preprocess the mdw data set for classification."""
    max_l = 10000

    def pad(x):
        return x[:max_l] if len(x) > max_l else x + [0] * (max_l - len(x))

    tokenized_data = get_tokenized_mdw(data)
    features = nd.array([pad(vocab.to_indices(x)) for x in tokenized_data])
    labels = nd.array([score for _, score in data])
    return features, labels

def softmax(X):
    X_exp =X.exp()
    partition = X_exp.sum(axis=1, keepdims=True)
    return X_exp / partition  

def mdw_predict(x,textnet,output=True):
    '''x is in ['test',label] format'''
    if len(x)==1:
        x = x[0]
    if output == True:
        print(x[0])
    if x[1] != -1 and output == True:
        print('True label is: %s'%C_C[inv_map[x[1]]])
    y = textnet(preprocess_mdw([x], vocab)[0].as_in_context(mx.cpu()))
    if output == True:
        print("Predicted label is: %s"%C_C[inv_map[y.argmax(axis=1).asscalar()]])
        m=softmax(y).asnumpy()
        plt.hist(m)
        plt.show()
        plt.close()
    try:
        return inv_map[y.argmax(axis=1).asscalar()],softmax(y).max().asscalar()
    except:
        return 'not found',0

def cleanText(text):
    phone = re.compile(r'\b\d{3}.{0,1}\d{3}.{0,1}\d{4}(HOME|CELL|MOBILE|PER|OTHER)?\b') 
    date = re.compile(r'\d{1,2}/+\d{1,2}/+\d{2,4}')
    date1 = re.compile(r'\d{2}/{0,1}\d{2}/{0,1}\d{2,4}')
    state = re.compile(r'\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\d{5}\b')
    country = re.compile(r'(JAPAN|MEXICO|ISRAEL|CHINA|THAILAND|PANAMA|AUSTRALIA|CANADA|PHILIPPINES|HOLLAND|INDIA|COSTA RICA|UNITED KINDOM|UK|GERMANY|BRAZIL|DOMINICAN|TAIWAN|KOREA|RUSSIA|GUADERRAMA)')

    test = apply_regex(clean_text,phone,text)
    test = apply_regex(rid_of_regex,state,test)
    test = apply_regex(rid_of_regex,country,test)
    test = apply_regex(clean_text,date,test)
    test = apply_regex(clean_text,date1,test)
    test= list(map(lambda x : ' '.join(x),map(lambda x :[x[0]+x[1] for x in re.findall('([A-Z]+)|([0-9]+)',x)],test)))
    return test

def get_tokenized_mdw(data):
    """Get the tokenized mdw data set for classification."""
    def tokenizer(text):
        return [tok.upper() for tok in text.split(' ')]
    return [tokenizer(text) for text, _ in data]

logging.info("define functions time: %f"%(time.time()-start_time))


inv_map = {v-1: k for k, v in y_encoder.items()}

try:
	edw_conn = pyodbc.connect("DSN=EDW; UID=097013; PWD=097ACE013#", autocommit=True)

	scoresql = '''select ace_mdw.mdwtodayproc();'''
	edw_cursor = edw_conn.cursor()
	edw_cursor.execute(scoresql)


	sqls = '''select mwid, clssn, mtext,t1fst,t1sec,t1fstscr,t1secscr,fo,finind,pcind
	  from ace_mdw.mdwdaily 
	 where pcind=true and finind=false and newdt = now()::date
	and (t1fst is null or ((t1sec is not null) and (t1fstscr< t1secscr * 1.25)));
	'''
	forlabelMDW = pd.read_sql(sqls, edw_conn)


	logging.info("run sql query time: %f"%(time.time()-start_time))

	if len(forlabelMDW.index) > 0:

		for i in forlabelMDW.index:
			t=cleanText([forlabelMDW['mtext'].values[i]])
			t.append(-1)
			s = mdw_predict(t,textnet,output=False)
			if s[1] > 0.5:    
				forlabelMDW.loc[i,'Prediction']=s[0]
				forlabelMDW.loc[i,'Confidence']=s[1]

		logging.info("execute mnet time: %f"%(time.time()-start_time))

		curdt = current_dt.strftime("%Y-%m-%d")
		ex = forlabelMDW[['clssn','Prediction','Confidence']]  
#		ex.insert(3,"DateToday",curdt)
		ex=ex.fillna(0)

		for index,row in ex.iterrows():
		   edw_cursor.execute("INSERT INTO ace_mdw.secfinding(clssn,catcol,cflevel,newdt) values (?,?,?,?)", row['clssn'],row['Prediction'],row['Confidence'],curdt)

		presql = '''select ace_mdw.mdwpreparetransfer();'''
		edw_cursor.execute(presql)
		
		tfsql = '''select clssn,fo,catdesc from ace_mdw.mdwdailytosql where newdt=(now()::date);'''
		tSQLlist=pd.read_sql(tfsql,edw_conn)
		
		sqlconn = pyodbc.connect('DSN=MDWSQL; UID=097013; PWD=097ACE013#')
		sqlcursor = sqlconn.cursor()

		for index,row in tSQLlist.iterrows():
			sqlcursor.execute("INSERT INTO dbo.mdwdaily(newdt,clssn,fo,catdesc) values (?,?,?,?)", curdt,row['clssn'],row['fo'],row['catdesc'])
		
		sqlconn.commit()
			
		sqlcursor.close()
		sqlconn.close()
		edw_cursor.close()
		edw_conn.close()

		logging.info("write back to SQL Server time: %f"%(time.time()-start_time))
	else:
		logging.info("No data available today")
except Exception as exp:
	logging.info(exp)
	

	try:
		from email.mime.text import MIMEText
		import smtplib

		from_email = 'zhong.fang@ssa.gov'
		to_email = 'zhong.fang@ssa.gov'
		
		msg = MIMEText(exp)
		msg['Subject'] = 'MDW Daily Run Failure'
		msg['From'] = from_email
		msg['To'] = to_email

		s = smtplib.SMTP('mailrelay.ssa.gov')   
		s.sendmail(from_email, to_email, msg.as_string())
		s.quit()
	except:
		pass

	
	try:
		edw_cursor.close()
		edw_conn.close()
	except:
		pass

	try:
		sqlconn.rollback()
	except:
		pass
		
	try:	
		sqlcursor.close()
		sqlconn.close()
	except:
		pass
