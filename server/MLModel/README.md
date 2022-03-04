# Machine Learning

Este directorio almacena todos los archivos encargados de realizar una clasificación de municipios.

Para ello, se hace uso de un modelo de machine learning previamente entrenado, en dodne cabe la posibilidad de poder entrenarlo nuevamente.

Los archivos que se encuentran en este directorio son:

| Archivo | Propósito |
| ------ | ------ |
| sorter.py | Realizar la clasificación de un municipio mediante el uso del modelo ya entrenado. |
| trainer.py | Generar nuevamente un modelo de entrenamiento basandose en las nopticias agreagadas en los scrapeos de información. |

## Herramientas utilizadas

- **Mariadb**: permite la conexión con la base de datos.
- **Dotenv**: permite acceder a las variables de entorno del archivo .env.
- **Pickle**: permite crear estructuras de datos para realizar cálculos.
- **Pandas**: proporciona estructuras de datos diseñadas para que el trabajo con datos relacionales.
- **Numpy**: permite utilizar arrays de diversas dimensiones y estructuras.
- **Nltk**: permite utilizar procesamiento del lenguaje natural.
- **Sklearn**: proporciona la implementación de la algorítmia de diversos modelos de clasificación.
- **Joblib**: pemite interpretar los modelos de clasificación.

## Comandos de instalación

Mariadb:

```sh
pip install mariadb
```

Dotenv:

```sh
pip install dotenv
```

Pickle:

```sh
pip install pickle
```

Pandas:

```sh
pip install pandas
```

Numpy:

```sh
pip install numpy
```

Nltk:

```sh
pip install nltk
```

Sklearn:

```sh
pip install scikit-learn
```

Joblib:

```sh
pip install joblib
```