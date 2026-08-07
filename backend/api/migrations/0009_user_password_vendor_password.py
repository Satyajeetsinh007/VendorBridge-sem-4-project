from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_purchaseorder_tax_amount_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=128, default='changeme'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vendor',
            name='password',
            field=models.CharField(max_length=128, default='changeme'),
            preserve_default=False,
        ),
    ]
